import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Building2, DollarSign, Users, TrendingUp, MessageSquare, Bell, MoreVertical, CheckCircle, Clock, Home, XCircle, ArrowUpRight, CalendarCheck, Clipboard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { VisitsTab } from "@/components/dashboard/VisitsTab";
import { OffersTab } from "@/components/dashboard/OffersTab";
import { AlertsTab } from "@/components/dashboard/AlertsTab";
import { MyBookingsTab } from "@/components/dashboard/MyBookingsTab";
import { SellerMessagesInline } from "@/components/dashboard/SellerMessagesInline";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
type Property = Tables<"properties">;
export default function Dashboard() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    conversations,
    getUnreadCount
  } = useMessages();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [pendingVisitsCount, setPendingVisitsCount] = useState(0);
  const [pendingOffersCount, setPendingOffersCount] = useState(0);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    propertyTitle: string;
    newStatus: string;
  }>({
    isOpen: false,
    propertyId: null,
    propertyTitle: "",
    newStatus: ""
  });
  const [inquiriesData, setInquiriesData] = useState<{ total: number; weeklyNew: number }>({ total: 0, weeklyNew: 0 });
  const [propertyInquiries, setPropertyInquiries] = useState<Record<string, number>>({});
  const unreadCount = getUnreadCount();
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  const fetchPendingVisitsCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from("property_visits")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "pending");
      if (error) throw error;
      setPendingVisitsCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching pending visits count:", error);
    }
  }, [user]);

  const fetchPendingOffersCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from("property_offers")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .eq("status", "pending");
      if (error) throw error;
      setPendingOffersCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching pending offers count:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchUnreadAlertsCount();
      fetchInquiriesData();
      fetchPendingVisitsCount();
      fetchPendingOffersCount();

      const alertsChannel = supabase.channel("dashboard-alerts").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "alerts",
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadAlertsCount();
      }).subscribe();

      const visitsChannel = supabase.channel("dashboard-visits").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "property_visits",
        filter: `seller_id=eq.${user.id}`
      }, (payload) => {
        fetchPendingVisitsCount();
        if (payload.eventType === "INSERT") {
          toast({
            title: "New Visit Request",
            description: "You have a new property visit request!",
          });
        }
      }).subscribe();

      const offersChannel = supabase.channel("dashboard-offers").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "property_offers",
        filter: `seller_id=eq.${user.id}`
      }, (payload) => {
        fetchPendingOffersCount();
        if (payload.eventType === "INSERT") {
          toast({
            title: "New Offer Received",
            description: "You have a new offer on your property!",
          });
        }
      }).subscribe();

      return () => {
        supabase.removeChannel(alertsChannel);
        supabase.removeChannel(visitsChannel);
        supabase.removeChannel(offersChannel);
      };
    }
  }, [user, fetchPendingVisitsCount, fetchPendingOffersCount, toast]);

  const fetchInquiriesData = async () => {
    try {
      const { data: allConversations, error: allError } = await supabase
        .from("conversations")
        .select("buyer_id, created_at, property_id")
        .eq("seller_id", user?.id);

      if (allError) throw allError;

      const uniqueBuyers = new Set(allConversations?.map(c => c.buyer_id) || []);
      const total = uniqueBuyers.size;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyConversations = allConversations?.filter(c => 
        new Date(c.created_at) >= oneWeekAgo
      ) || [];
      const weeklyUniqueBuyers = new Set(weeklyConversations.map(c => c.buyer_id));
      const weeklyNew = weeklyUniqueBuyers.size;

      setInquiriesData({ total, weeklyNew });

      const propertyBuyerCounts: Record<string, Set<string>> = {};
      allConversations?.forEach(c => {
        if (c.property_id) {
          if (!propertyBuyerCounts[c.property_id]) {
            propertyBuyerCounts[c.property_id] = new Set();
          }
          propertyBuyerCounts[c.property_id].add(c.buyer_id);
        }
      });
      
      const counts: Record<string, number> = {};
      Object.entries(propertyBuyerCounts).forEach(([propertyId, buyers]) => {
        counts[propertyId] = buyers.size;
      });
      setPropertyInquiries(counts);
    } catch (error: any) {
      console.error("Error fetching inquiries data:", error);
    }
  };
  const fetchUnreadAlertsCount = async () => {
    try {
      const {
        count,
        error
      } = await supabase.from("alerts").select("*", {
        count: "exact",
        head: true
      }).eq("user_id", user?.id).eq("is_read", false);
      if (error) throw error;
      setUnreadAlertsCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching alerts count:", error);
    }
  };
  const fetchProperties = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("properties").select("*").eq("user_id", user?.id).order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (propertyId: string) => {
    try {
      const {
        error
      } = await supabase.from("properties").delete().eq("id", propertyId);
      if (error) throw error;
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: "Success",
        description: "Property deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive"
      });
    }
  };
  const openStatusChangeDialog = (propertyId: string, propertyTitle: string, newStatus: string) => {
    setStatusChangeDialog({
      isOpen: true,
      propertyId,
      propertyTitle,
      newStatus
    });
  };
  const confirmStatusChange = async () => {
    if (!statusChangeDialog.propertyId) return;
    try {
      const {
        error
      } = await supabase.from("properties").update({
        status: statusChangeDialog.newStatus as any
      }).eq("id", statusChangeDialog.propertyId);
      if (error) throw error;
      setProperties(prev => prev.map(p => p.id === statusChangeDialog.propertyId ? {
        ...p,
        status: statusChangeDialog.newStatus as any
      } : p));
      toast({
        title: "Status Updated",
        description: `Property status changed to ${statusChangeDialog.newStatus}`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setStatusChangeDialog({
        isOpen: false,
        propertyId: null,
        propertyTitle: "",
        newStatus: ""
      });
    }
  };
  const getStatusBadge = (status: string | null) => {
    const statusStyles: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700 border-emerald-200",
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      sold: "bg-indigo-100 text-indigo-700 border-indigo-200",
      rented: "bg-rose-100 text-rose-700 border-rose-200",
      under_review: "bg-orange-100 text-orange-700 border-orange-200",
      declined: "bg-red-100 text-red-700 border-red-200"
    };
    const displayStatus = status === 'under_review' ? 'Under Review' : status || 'active';
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[status || "active"] || ""}`}>
        {displayStatus}
      </span>;
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  };
  const activeCount = properties.filter(p => p.status === "active").length;
  const pendingCount = properties.filter(p => p.status === "pending").length;
  const soldCount = properties.filter(p => p.status === "sold").length;
  const rentedCount = properties.filter(p => p.status === "rented").length;
  const underReviewCount = properties.filter(p => p.status === "under_review").length;
  const declinedCount = properties.filter(p => p.status === "declined").length;

  const stats = [{
    title: "Total Listings",
    value: properties.length,
    icon: Home,
    breakdown: [
      { label: "active", count: activeCount, color: "text-emerald-600" },
      { label: "under review", count: underReviewCount, color: "text-orange-600" },
      { label: "pending", count: pendingCount, color: "text-amber-600" },
      { label: "sold", count: soldCount, color: "text-indigo-600" },
      { label: "rented", count: rentedCount, color: "text-rose-600" },
      { label: "declined", count: declinedCount, color: "text-red-600" }
    ].filter(item => item.count > 0)
  }, {
    title: "Total Value",
    value: formatPrice(properties.reduce((acc, p) => acc + p.price, 0)),
    icon: DollarSign,
  }, {
    title: "Inquiries",
    value: inquiriesData.total,
    icon: MessageSquare,
    trend: inquiriesData.weeklyNew > 0 ? `+${inquiriesData.weeklyNew} new this week` : null
  }, {
    title: "Alerts",
    value: unreadAlertsCount,
    icon: Bell,
  }];

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>;
  }

  return <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl shadow-sm border border-border/50 p-5 sm:p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Seller Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="gold" className="rounded-lg shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-lg border border-border/50 p-1">
                  <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5 cursor-pointer">
                    <Link to="/add-property" className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-accent" />
                      <span className="font-medium">Add Property</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/property-requirements")}
                    className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                  >
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">Buyer Requirements</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("visits")}
                    className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                  >
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Manage Visits</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setActiveTab("offers")}
                    className="rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-3"
                  >
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium">View Offers</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-card rounded-2xl shadow-sm border border-border/50 p-5 flex items-center justify-between group hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  {'breakdown' in stat && stat.breakdown && stat.breakdown.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {stat.breakdown.map((item, i) => (
                        <span key={item.label}>
                          <span className={item.color}>{item.count} {item.label}</span>
                          {i < stat.breakdown.length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                  )}
                  {'trend' in stat && stat.trend && (
                    <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1 font-medium">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-accent-foreground shrink-0 ml-4 shadow-sm">
                  <stat.icon className="h-5 w-5" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tab List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation inside a card-like container */}
              <div className="bg-card rounded-2xl shadow-sm border border-border/50 px-4 sm:px-6 pt-1 mb-6">
                <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 gap-0 overflow-x-auto">
                  <TabsTrigger
                    value="listings"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    <Building2 className="w-4 h-4 mr-1.5" />
                    My Listings
                  </TabsTrigger>
                  <TabsTrigger
                    value="visits"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors relative text-sm font-medium"
                  >
                    <CalendarCheck className="w-4 h-4 mr-1.5" />
                    Visits
                    {pendingVisitsCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                        {pendingVisitsCount > 9 ? '9+' : pendingVisitsCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="offers"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors relative text-sm font-medium"
                  >
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    Offers
                    {pendingOffersCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                        {pendingOffersCount > 9 ? '9+' : pendingOffersCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors relative text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                  >
                    <Clipboard className="w-4 h-4 mr-1.5" />
                    My Bookings
                  </TabsTrigger>
                  <TabsTrigger
                    value="alerts"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3.5 text-muted-foreground hover:text-foreground transition-colors relative text-sm font-medium"
                  >
                    <Bell className="w-4 h-4 mr-1.5" />
                    Alerts
                    {unreadAlertsCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground">
                        {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <TabsContent value="listings" className="mt-0">
                <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      Your Properties
                    </h3>
                    <Button variant="outline" size="sm" asChild className="rounded-lg">
                      <Link to="/add-property">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add Property
                      </Link>
                    </Button>
                  </div>
                  <div className="p-5 sm:p-6 pt-0 sm:pt-0">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                      </div>
                    ) : properties.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No properties yet
                        </h3>
                        <p className="text-muted-foreground mb-6 text-sm">
                          Start by adding your first property listing
                        </p>
                        <Button variant="gold" asChild className="rounded-lg">
                          <Link to="/add-property">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Property
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto mt-5">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="text-muted-foreground font-medium">Property</TableHead>
                              <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                              <TableHead className="text-muted-foreground font-medium">Price</TableHead>
                              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                              <TableHead className="text-muted-foreground font-medium">
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Inquiries
                                </div>
                              </TableHead>
                              <TableHead className="text-muted-foreground font-medium">Listed</TableHead>
                              <TableHead className="text-right text-muted-foreground font-medium">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {properties.map(property => (
                              <TableRow key={property.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                      {property.images && property.images[0] ? (
                                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Building2 className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground line-clamp-1 text-sm">
                                        {property.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {property.city}, {property.state}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="capitalize text-sm">
                                  {property.property_type}
                                </TableCell>
                                <TableCell className="font-semibold text-sm">
                                  {formatPrice(property.price)}
                                  {property.listing_type === "rent" && <span className="text-muted-foreground text-xs font-normal">/mo</span>}
                                </TableCell>
                                <TableCell>{getStatusBadge(property.status)}</TableCell>
                                <TableCell>
                                  <span className={`text-sm ${propertyInquiries[property.id] > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                    {propertyInquiries[property.id] || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {new Date(property.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover rounded-xl shadow-lg border border-border/50">
                                      <DropdownMenuItem asChild>
                                        <Link to={`/property/${property.id}`} className="flex items-center gap-2 cursor-pointer">
                                          <Eye className="w-4 h-4" />
                                          View
                                        </Link>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem asChild>
                                        <Link to={`/edit-property/${property.id}`} className="flex items-center gap-2 cursor-pointer">
                                          <Edit className="w-4 h-4" />
                                          Edit
                                        </Link>
                                      </DropdownMenuItem>
                                      {property.status !== 'under_review' && property.status !== 'declined' && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                                              <CheckCircle className="w-4 h-4" />
                                              Change Status
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="bg-popover rounded-xl">
                                              {(property.status === 'sold' || property.status === 'rented') && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'active')} className="flex items-center gap-2 cursor-pointer">
                                                  <Home className="w-4 h-4 text-emerald-500" />
                                                  Active
                                                </DropdownMenuItem>
                                              )}
                                              {property.status !== 'pending' && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'pending')} className="flex items-center gap-2 cursor-pointer">
                                                  <Clock className="w-4 h-4 text-amber-500" />
                                                  Pending
                                                </DropdownMenuItem>
                                              )}
                                              {property.status !== 'sold' && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'sold')} className="flex items-center gap-2 cursor-pointer">
                                                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                                                  Sold
                                                </DropdownMenuItem>
                                              )}
                                              {property.status !== 'rented' && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'rented')} className="flex items-center gap-2 cursor-pointer">
                                                  <XCircle className="w-4 h-4 text-muted-foreground" />
                                                  Rented
                                                </DropdownMenuItem>
                                              )}
                                            </DropdownMenuSubContent>
                                          </DropdownMenuSub>
                                        </>
                                      )}
                                      <DropdownMenuSeparator />
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-2xl">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete "{property.title}"? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="visits" className="mt-0">
                <VisitsTab onDataChange={fetchPendingVisitsCount} />
              </TabsContent>

              <TabsContent value="offers" className="mt-0">
                <OffersTab onDataChange={fetchPendingOffersCount} />
              </TabsContent>

              <TabsContent value="messages" className="mt-0">
                <SellerMessagesInline />
              </TabsContent>

              <TabsContent value="alerts" className="mt-0">
                <AlertsTab />
              </TabsContent>

              <TabsContent value="bookings" className="mt-0">
                <MyBookingsTab />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={statusChangeDialog.isOpen} onOpenChange={open => !open && setStatusChangeDialog({
        isOpen: false,
        propertyId: null,
        propertyTitle: "",
        newStatus: ""
      })}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Change Listing Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of "{statusChangeDialog.propertyTitle}" to <span className="font-semibold capitalize">{statusChangeDialog.newStatus}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} className="rounded-lg">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}
