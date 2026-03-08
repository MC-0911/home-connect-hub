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
import { OffersSection } from "@/components/agent/OffersSection";
import { TenantsSection } from "@/components/agent/TenantsSection";
import { useAuth } from "@/hooks/useAuth";
import { useAgentRealtime } from "@/hooks/useAgentRealtime";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertsDropdown } from "@/components/agent/AlertsDropdown";
import { Footer } from "@/components/layout/Footer";

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    listings, leads, appointments, documents, unreadMessages, unreadAlerts,
    stats, recentActivity, loading: dataLoading,
    refreshListings, refreshLeads, refreshAppointments, refreshDocuments,
  } = useAgentRealtime(setActiveSection);

  if (dataLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!user) return null;

  const renderSection = () => {
    switch (activeSection) {
      case "listings": return <ListingsSection listings={listings} onRefresh={refreshListings} />;
      case "offers": return <OffersSection onRefresh={refreshListings} />;
      case "leads": return <LeadsSection leads={leads} onRefresh={refreshLeads} />;
      case "tenants": return <TenantsSection />;
      case "calendar": return <CalendarSection appointments={appointments} onRefresh={refreshAppointments} />;
      case "messages": return <MessagesSection unreadCount={unreadMessages} />;
      case "documents": return <DocumentsSection />;
      case "analytics": return <AnalyticsSection stats={stats} />;
      case "settings": return <SettingsSection />;
      default: return <OverviewSection stats={stats} recentActivity={recentActivity} onNavigate={setActiveSection} listings={listings} leads={leads} appointments={appointments} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AgentSidebar activeSection={activeSection} onSectionChange={setActiveSection} collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}>
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
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-4">
                <AlertsDropdown unreadCount={unreadAlerts} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setActiveSection("messages")} className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                          {unreadMessages > 9 ? "9+" : unreadMessages}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Messages</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setActiveSection("settings")} className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Settings</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
        <Footer />
      </main>
    </div>
  );
}
