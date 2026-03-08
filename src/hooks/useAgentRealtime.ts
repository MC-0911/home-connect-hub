import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

interface AgentStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalLeads: number;
  newLeads: number;
  totalViews: number;
  monthlyCommission: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
}

export function useAgentRealtime() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Tables<"properties">[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStats] = useState<AgentStats>({
    totalListings: 0, activeListings: 0, soldListings: 0,
    totalLeads: 0, newLeads: 0, totalViews: 0, monthlyCommission: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Use ref to avoid stale closures in subscription callbacks
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  const fetchListings = useCallback(async () => {
    if (!userRef.current) return;
    const { data } = await supabase.from("properties").select("*")
      .eq("user_id", userRef.current.id).order("created_at", { ascending: false });
    if (data) setListings(data);
  }, []);

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from("buyer_requirements").select("*")
      .order("created_at", { ascending: false }).limit(50);
    if (data) setLeads(data);
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!userRef.current) return;
    const { data } = await supabase.from("property_visits").select("*, properties(title, city, state)")
      .eq("seller_id", userRef.current.id).order("preferred_date", { ascending: true });
    if (data) setAppointments(data.map((v: any) => ({
      ...v,
      property_title: v.properties?.title,
      property_location: [v.properties?.city, v.properties?.state].filter(Boolean).join(", "),
    })));
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!userRef.current) return;
    const { data } = await supabase.storage.from("property-images").list(userRef.current.id, { limit: 50 });
    if (data) setDocuments(data);
  }, []);

  const fetchUnreadMessages = useCallback(async () => {
    if (!userRef.current) return;
    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true })
      .eq("is_read", false).neq("sender_id", userRef.current.id);
    setUnreadMessages(count || 0);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!userRef.current) return;
    const userId = userRef.current.id;

    const [propsRes, offersRes, visitsRes] = await Promise.all([
      supabase.from("properties").select("price, status").eq("user_id", userId),
      supabase.from("property_offers").select("id, created_at").eq("seller_id", userId),
      supabase.from("property_visits").select("id, created_at").eq("seller_id", userId),
    ]);

    const props = propsRes.data;
    const offersData = offersRes.data;
    const visitsData = visitsRes.data;

    const total = props?.length || 0;
    const active = props?.filter((p) => p.status === "active").length || 0;
    const sold = props?.filter((p) => p.status === "sold" || p.status === "rented").length || 0;
    const commission = sold * 15000;

    setStats({
      totalListings: total, activeListings: active, soldListings: sold,
      totalLeads: offersData?.length || 0, newLeads: 0,
      totalViews: 0, monthlyCommission: commission,
    });

    const activities: RecentActivity[] = [];
    offersData?.slice(0, 3).forEach((o) => activities.push({
      id: o.id, type: "offer", title: "New offer received", time: "Recently",
    }));
    visitsData?.slice(0, 3).forEach((v) => activities.push({
      id: v.id, type: "visit", title: "Visit scheduled",
      time: new Date(v.created_at).toLocaleDateString(),
    }));
    setRecentActivity(activities.slice(0, 6));
  }, []);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([
      fetchListings(), fetchLeads(), fetchAppointments(),
      fetchDocuments(), fetchStats(), fetchUnreadMessages(),
    ]);
    setLoading(false);
  }, [user, fetchListings, fetchLeads, fetchAppointments, fetchDocuments, fetchStats, fetchUnreadMessages]);

  // Initial fetch
  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      // Properties changes
      supabase
        .channel("rt-agent-properties")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "properties",
          filter: `user_id=eq.${user.id}`,
        }, () => {
          fetchListings();
          fetchStats();
        })
        .subscribe(),

      // Visits / appointments
      supabase
        .channel("rt-agent-visits")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "property_visits",
          filter: `seller_id=eq.${user.id}`,
        }, () => {
          fetchAppointments();
          fetchStats();
        })
        .subscribe(),

      // Offers
      supabase
        .channel("rt-agent-offers")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "property_offers",
          filter: `seller_id=eq.${user.id}`,
        }, () => {
          fetchStats();
        })
        .subscribe(),

      // Messages
      supabase
        .channel("rt-agent-messages")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "messages",
        }, () => {
          fetchUnreadMessages();
        })
        .subscribe(),

      // Leads / buyer requirements
      supabase
        .channel("rt-agent-leads")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "buyer_requirements",
        }, () => {
          fetchLeads();
        })
        .subscribe(),

      // Tasks
      supabase
        .channel("rt-agent-tasks")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "agent_tasks",
          filter: `user_id=eq.${user.id}`,
        }, () => {
          // Tasks are managed locally in OverviewSection, but we broadcast for sidebar/other consumers
        })
        .subscribe(),

      // Alerts
      supabase
        .channel("rt-agent-alerts")
        .on("postgres_changes", {
          event: "*", schema: "public", table: "alerts",
          filter: `user_id=eq.${user.id}`,
        }, () => {
          // Alerts badge can be consumed by header
        })
        .subscribe(),
    ];

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [user, fetchListings, fetchAppointments, fetchStats, fetchUnreadMessages, fetchLeads]);

  return {
    listings, leads, appointments, documents, unreadMessages,
    stats, recentActivity, loading,
    refreshListings: fetchListings,
    refreshLeads: fetchLeads,
    refreshAppointments: fetchAppointments,
    refreshDocuments: fetchDocuments,
    refreshAll: fetchAll,
  };
}
