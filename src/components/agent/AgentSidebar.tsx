import {
  LayoutDashboard, Building2, Users, CalendarDays, MessageSquare,
  FileText, BarChart3, Settings, LogOut, Home, Crown, ChevronLeft, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "listings", label: "My Properties", icon: Building2 },
  { id: "leads", label: "Clients", icon: Users },
  { id: "calendar", label: "Appointments", icon: CalendarDays },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AgentSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AgentSidebar({ activeSection, onSectionChange }: AgentSidebarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingVisits, setPendingVisits] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false)
        .neq("sender_id", user.id);
      setUnreadMessages(msgCount || 0);

      const { count: visitCount } = await supabase
        .from("property_visits")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "pending");
      setPendingVisits(visitCount || 0);

      const { count: propCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setListingsCount(propCount || 0);
    };

    fetchCounts();

    const msgChannel = supabase
      .channel("sidebar-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .subscribe();

    const visitChannel = supabase
      .channel("sidebar-visits")
      .on("postgres_changes", { event: "*", schema: "public", table: "property_visits" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(visitChannel);
    };
  }, [user]);

  const getBadgeCount = (id: string) => {
    if (id === "messages") return unreadMessages;
    if (id === "calendar") return pendingVisits;
    if (id === "listings") return listingsCount;
    return 0;
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 100%)",
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/10 shrink-0">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-display font-bold text-white whitespace-nowrap"
              >
                Royal Landmark
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Agent Profile */}
      <div className={cn("px-5 py-6 border-b border-white/10", collapsed && "px-3 py-4")}>
        <div className="flex flex-col items-center gap-2">
          <Avatar className={cn("border-3 border-white/40 transition-all", collapsed ? "h-10 w-10" : "h-[100px] w-[100px]")}>
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-white/20 text-white text-2xl font-semibold">
              {profile?.full_name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center mt-1"
              >
                <p className="text-white font-semibold text-lg">
                  {profile?.full_name || "Agent"}
                </p>
                <p className="text-white/60 text-sm">Senior Real Estate Agent</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          const count = getBadgeCount(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-white/20 text-white shadow-lg shadow-black/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="agent-nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow-lg")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap flex-1 text-left"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {count > 0 && !collapsed && (
                <span className="bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                  {count}
                </span>
              )}
              {count > 0 && collapsed && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
