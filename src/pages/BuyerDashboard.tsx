import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BuyerSidebar } from "@/components/buyer/BuyerSidebar";
import { DiscoverSection } from "@/components/buyer/DiscoverSection";
import { FavoritesSection } from "@/components/buyer/FavoritesSection";
import { SavedSearchesSection } from "@/components/buyer/SavedSearchesSection";
import { ViewingsSection } from "@/components/buyer/ViewingsSection";
import { CompareSection } from "@/components/buyer/CompareSection";
import { MortgageCalculatorSection } from "@/components/buyer/MortgageCalculatorSection";
import { BuyerMessagesSection } from "@/components/buyer/BuyerMessagesSection";
import { BuyerSettingsSection } from "@/components/buyer/BuyerSettingsSection";
import { BuyerOffersSection } from "@/components/buyer/BuyerOffersSection";
import { BuyerPropertyDetail } from "@/components/buyer/BuyerPropertyDetail";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Settings, Plus, Heart, Calculator, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertsDropdown } from "@/components/agent/AlertsDropdown";
import { Footer } from "@/components/layout/Footer";

type SearchFilters = {
  listingType: "sale" | "rent";
  propertyType: string;
  bedrooms: string;
  maxPrice: number;
  searchQuery: string;
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("discover");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<SearchFilters | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  if (!user) return null;

  const handleRunSearch = (filters: SearchFilters) => {
    setPendingFilters(filters);
    setActiveSection("discover");
  };

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    discover: { title: "Buyer Dashboard", subtitle: format(new Date(), "EEEE, MMMM d, yyyy") },
    favorites: { title: "Favorites", subtitle: "Properties you've saved" },
    "saved-searches": { title: "Saved Searches", subtitle: "Your saved search criteria" },
    viewings: { title: "Viewings", subtitle: "Scheduled property viewings" },
    offers: { title: "My Offers", subtitle: "Track and manage your property offers" },
    compare: { title: "Compare", subtitle: "Side-by-side property comparison" },
    calculator: { title: "Mortgage Calculator", subtitle: "Estimate your monthly payments" },
    messages: { title: "Messages", subtitle: "Your conversations" },
    settings: { title: "Settings", subtitle: "Manage your account" },
  };

  const renderSection = () => {
    switch (activeSection) {
      case "discover": return <DiscoverSection initialFilters={pendingFilters} />;
      case "favorites": return <FavoritesSection />;
      case "saved-searches": return <SavedSearchesSection onRunSearch={handleRunSearch} />;
      case "viewings": return <ViewingsSection />;
      case "offers": return <BuyerOffersSection />;
      case "compare": return <CompareSection />;
      case "calculator": return <MortgageCalculatorSection />;
      case "messages": return <BuyerMessagesSection />;
      case "settings": return <BuyerSettingsSection />;
      default: return <DiscoverSection initialFilters={pendingFilters} />;
    }
  };

  const current = sectionTitles[activeSection] || sectionTitles.discover;

  return (
    <div className="min-h-screen flex bg-muted/30">
      <BuyerSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 280 }}>
        {/* Top Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border/50"
        >
          <div className="flex items-center justify-between px-6 sm:px-8 py-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">{current.title}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{current.subtitle}</p>
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
                    <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5 cursor-pointer">
                      <Link to="/property-requirements" className="flex items-center gap-3">
                        <Plus className="w-4 h-4 text-accent" />
                        <span className="font-medium">Submit Requirements</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("favorites")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="font-medium">View Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("compare")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <GitCompare className="w-4 h-4 text-primary" />
                      <span className="font-medium">Compare Properties</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveSection("calculator")}
                      className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                    >
                      <Calculator className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium">Mortgage Calculator</span>
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
                <AlertsDropdown unreadCount={0} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setActiveSection("messages")} className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
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
