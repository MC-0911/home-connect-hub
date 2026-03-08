import {
  Compass, Heart, Bookmark, CalendarDays, Scale, Calculator,
  MessageSquare, Settings, Crown, ChevronLeft, ChevronRight, Home, FileText
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
  { id: "discover", label: "Discover", icon: Compass },
  { id: "favorites", label: "Favorites", icon: Heart },
  { id: "saved-searches", label: "Saved Searches", icon: Bookmark },
  { id: "viewings", label: "Viewings", icon: CalendarDays },
  { id: "compare", label: "Compare", icon: Scale },
  { id: "calculator", label: "Mortgage Calc", icon: Calculator },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

interface BuyerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function BuyerSidebar({ activeSection, onSectionChange, collapsed, onToggleCollapse }: BuyerSidebarProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [viewingsCount, setViewingsCount] = useState(0);
  const [savedSearchesCount, setSavedSearchesCount] = useState(0);

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
        .eq("user_id", user.id);
      setViewingsCount(visitCount || 0);

      const { count: favCount } = await supabase
        .from("favorites" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setFavoritesCount(favCount || 0);

      const { count: searchCount } = await supabase
        .from("saved_searches" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setSavedSearchesCount(searchCount || 0);
    };

    fetchCounts();

    const msgChannel = supabase
      .channel("buyer-sidebar-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .subscribe();

    const visitChannel = supabase
      .channel("buyer-sidebar-visits")
      .on("postgres_changes", { event: "*", schema: "public", table: "property_visits" }, fetchCounts)
      .subscribe();

    const favChannel = supabase
      .channel("buyer-sidebar-favorites")
      .on("postgres_changes", { event: "*", schema: "public", table: "favorites" }, fetchCounts)
      .subscribe();

    const searchChannel = supabase
      .channel("buyer-sidebar-searches")
      .on("postgres_changes", { event: "*", schema: "public", table: "saved_searches" }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(visitChannel);
      supabase.removeChannel(favChannel);
      supabase.removeChannel(searchChannel);
    };
  }, [user]);

  const getBadgeCount = (id: string) => {
    if (id === "messages") return unreadMessages;
    if (id === "viewings") return viewingsCount;
    if (id === "favorites") return favoritesCount;
    if (id === "saved-searches") return savedSearchesCount;
    return 0;
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-50 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
      }}
    >
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-3")}>
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-white/10 shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white whitespace-nowrap truncate">
                Royal Landmark
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className={cn("px-5 py-6 border-b border-white/10", collapsed && "px-3 py-4")}>
        <div className="flex flex-col items-center gap-2">
          <Avatar className={cn("border-3 border-sky-400/40 transition-all", collapsed ? "h-10 w-10" : "h-[80px] w-[80px]")}>
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-white/20 text-white text-2xl font-semibold">
              {profile?.full_name?.charAt(0) || "B"}
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
                  {profile?.full_name || "Buyer"}
                </p>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs bg-sky-400/20 text-sky-300">
                  Home Buyer
                </span>
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
                  ? "bg-sky-500/20 text-white shadow-lg shadow-black/10"
                  : "text-white/70 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="buyer-nav-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-400 rounded-r-full"
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

    </motion.aside>
  );
}
