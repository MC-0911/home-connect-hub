import { useState } from "react";
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
import ListingFormWizard from "@/components/listing/ListingFormWizard";
import { useAuth } from "@/hooks/useAuth";
import { useAgentRealtime } from "@/hooks/useAgentRealtime";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Settings, Plus, Home, Users, Wrench, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
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

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: "Agent Dashboard", subtitle: format(new Date(), "EEEE, MMMM d, yyyy") },
    listings: { title: "My Listings", subtitle: "Manage your property listings" },
    offers: { title: "Offers", subtitle: "Review and respond to property offers" },
    leads: { title: "Leads", subtitle: "Track and manage your leads" },
    tenants: { title: "Tenants", subtitle: "Manage tenants and leases" },
    calendar: { title: "Calendar", subtitle: "Appointments and schedule" },
    messages: { title: "Messages", subtitle: "Your conversations" },
    documents: { title: "Documents", subtitle: "Manage your files and documents" },
    analytics: { title: "Analytics", subtitle: "Performance metrics and insights" },
    "add-property": { title: "Add Property", subtitle: "Create a new property listing" },
  };

  const currentSection = sectionTitles[activeSection] || sectionTitles.overview;

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
      case "add-property": return <ListingFormWizard />;
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
          <div className="flex items-center justify-between px-6 sm:px-8 py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">{currentSection.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{currentSection.subtitle}</p>
            </div>
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="gold" size="sm" className="rounded-lg shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Quick Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border/50 p-1">
                    <DropdownMenuItem
                      onClick={() => setActiveSection("add-property")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <Plus className="w-4 h-4 text-accent" />
                      <span className="font-medium">Add Property</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("tenants")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">Add Tenant</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("calendar")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span className="font-medium">Maintenance Request</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("documents")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <FileUp className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium">Upload Document</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 w-56 bg-muted/50 border-border/50 rounded-xl h-10"
                  />
                </div>
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
