import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentSidebar } from "@/components/agent/AgentSidebar";
import { OverviewSection } from "@/components/agent/OverviewSection";
import { ListingsSection } from "@/components/agent/ListingsSection";
import { LeadsSection } from "@/components/agent/LeadsSection";
import { CalendarSection } from "@/components/agent/CalendarSection";
import { MessagesSection } from "@/components/agent/MessagesSection";
import { DocumentsSection } from "@/components/agent/DocumentsSection";
import { AnalyticsSection } from "@/components/agent/AnalyticsSection";
import { SettingsSection } from "@/components/agent/SettingsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Search, Bell, MessageSquare, Settings } from "lucide-react";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

export default function AgentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [listings, setListings] = useState<Tables<"properties">[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [stats, setStats] = useState({
    totalListings: 0, activeListings: 0, soldListings: 0,
    totalLeads: 0, newLeads: 0, totalViews: 0, monthlyCommission: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    await Promise.all([
      fetchListings(), fetchLeads(), fetchAppointments(),
      fetchDocuments(), fetchStats(), fetchUnreadMessages(),
    ]);
  };

  const fetchListings = async () => {
    const { data } = await supabase.from("properties").select("*")
      .eq("user_id", user!.id).order("created_at", { ascending: false });
    if (data) setListings(data);
  };

  const fetchLeads = async () => {
    const { data } = await supabase.from("buyer_requirements").select("*")
      .order("created_at", { ascending: false }).limit(50);
    if (data) setLeads(data);
  };

  const fetchAppointments = async () => {
    const { data } = await supabase.from("property_visits").select("*, properties(title, city, state)")
      .eq("seller_id", user!.id).order("preferred_date", { ascending: true });
    if (data) setAppointments(data.map((v: any) => ({
      ...v,
      property_title: v.properties?.title,
      property_location: [v.properties?.city, v.properties?.state].filter(Boolean).join(", "),
    })));
  };

  const fetchDocuments = async () => {
    const { data } = await supabase.storage.from("property-images").list(user!.id, { limit: 50 });
    if (data) setDocuments(data);
  };

  const fetchUnreadMessages = async () => {
    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true })
      .eq("is_read", false).neq("sender_id", user!.id);
    setUnreadMessages(count || 0);
  };

  const fetchStats = async () => {
    const { data: props } = await supabase.from("properties").select("price, status")
      .eq("user_id", user!.id);
    const { data: offersData } = await supabase.from("property_offers").select("id")
      .eq("seller_id", user!.id);
    const { data: visitsData } = await supabase.from("property_visits").select("id, created_at")
      .eq("seller_id", user!.id);

    const total = props?.length || 0;
    const active = props?.filter((p) => p.status === "active").length || 0;
    const sold = props?.filter((p) => p.status === "sold" || p.status === "rented").length || 0;
    const commission = sold * 15000;

    setStats({
      totalListings: total, activeListings: active, soldListings: sold,
      totalLeads: offersData?.length || 0, newLeads: 0,
      totalViews: 0, monthlyCommission: commission,
    });

    const activities: any[] = [];
    offersData?.slice(0, 3).forEach((o) => activities.push({
      id: o.id, type: "offer", title: "New offer received", time: "Recently",
    }));
    visitsData?.slice(0, 3).forEach((v) => activities.push({
      id: v.id, type: "visit", title: "Visit scheduled",
      time: new Date(v.created_at).toLocaleDateString(),
    }));
    setRecentActivity(activities.slice(0, 6));
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  const sectionTitle: Record<string, string> = {
    overview: "Dashboard",
    listings: "My Properties",
    leads: "Clients",
    calendar: "Appointments",
    messages: "Messages",
    documents: "Documents",
    analytics: "Analytics",
    settings: "Settings",
  };

  const renderSection = () => {
    switch (activeSection) {
      case "listings": return <ListingsSection listings={listings} onRefresh={fetchListings} />;
      case "leads": return <LeadsSection leads={leads} onRefresh={fetchLeads} />;
      case "calendar": return <CalendarSection appointments={appointments} onRefresh={fetchAppointments} />;
      case "messages": return <MessagesSection unreadCount={unreadMessages} />;
      case "documents": return <DocumentsSection documents={documents} onRefresh={fetchDocuments} />;
      case "analytics": return <AnalyticsSection stats={stats} />;
      case "settings": return <SettingsSection />;
      default: return <OverviewSection stats={stats} recentActivity={recentActivity} onNavigate={setActiveSection} listings={listings} leads={leads} appointments={appointments} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AgentSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      <main className="flex-1 ml-[280px] transition-all duration-300">
        {/* Top Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50"
        >
          <div className="flex items-center justify-between px-8 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties, clients..."
                className="pl-9 w-72 bg-muted/50 border-border/50 rounded-xl h-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">3</span>
              </button>
              <button className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </button>
              <button className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <div className="p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
