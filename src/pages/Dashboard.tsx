import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Building2, DollarSign, Users, TrendingUp, Heart, MessageSquare, Bell, MoreVertical, CheckCircle, Clock, Home, XCircle, ArrowUpRight, CalendarCheck, Clipboard } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { VisitsTab } from "@/components/dashboard/VisitsTab";
import { OffersTab } from "@/components/dashboard/OffersTab";
import { AlertsTab } from "@/components/dashboard/AlertsTab";
import { MyBookingsTab } from "@/components/dashboard/MyBookingsTab";
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
import { formatDistanceToNow } from "date-fns";
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

      // Subscribe to alerts changes
      const alertsChannel = supabase.channel("dashboard-alerts").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "alerts",
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadAlertsCount();
      }).subscribe();

      // Subscribe to visits changes for real-time notifications
      const visitsChannel = supabase.channel("dashboard-visits").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "property_visits",
        filter: `seller_id=eq.${user.id}`
      }, (payload) => {
        console.log("Visit change received:", payload);
        fetchPendingVisitsCount();
        if (payload.eventType === "INSERT") {
          toast({
            title: "New Visit Request",
            description: "You have a new property visit request!",
          });
        }
      }).subscribe();

      // Subscribe to offers changes for real-time notifications
      const offersChannel = supabase.channel("dashboard-offers").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "property_offers",
        filter: `seller_id=eq.${user.id}`
      }, (payload) => {
        console.log("Offer change received:", payload);
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
      // Get all conversations where the user is the seller (property owner)
      const { data: allConversations, error: allError } = await supabase
        .from("conversations")
        .select("buyer_id, created_at, property_id")
        .eq("seller_id", user?.id);

      if (allError) throw allError;

      // Count unique buyers
      const uniqueBuyers = new Set(allConversations?.map(c => c.buyer_id) || []);
      const total = uniqueBuyers.size;

      // Count new inquiries from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyConversations = allConversations?.filter(c => 
        new Date(c.created_at) >= oneWeekAgo
      ) || [];
      const weeklyUniqueBuyers = new Set(weeklyConversations.map(c => c.buyer_id));
      const weeklyNew = weeklyUniqueBuyers.size;

      setInquiriesData({ total, weeklyNew });

      // Count unique buyers per property
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
      active: "bg-green-500/10 text-green-600 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      sold: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      rented: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      under_review: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      declined: "bg-red-500/10 text-red-600 border-red-500/20"
    };
    const displayStatus = status === 'under_review' ? 'Under Review' : status || 'active';
    return <Badge variant="outline" className={`capitalize ${statusStyles[status || "active"] || ""}`}>
        {displayStatus}
      </Badge>;
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
    color: "text-accent",
    breakdown: [
      { label: "active", count: activeCount, color: "text-green-600" },
      { label: "under review", count: underReviewCount, color: "text-orange-600" },
      { label: "pending", count: pendingCount, color: "text-yellow-600" },
      { label: "sold", count: soldCount, color: "text-blue-600" },
      { label: "rented", count: rentedCount, color: "text-purple-600" },
      { label: "declined", count: declinedCount, color: "text-red-600" }
    ].filter(item => item.count > 0)
  }, {
    title: "Total Value",
    value: formatPrice(properties.reduce((acc, p) => acc + p.price, 0)),
    icon: DollarSign,
    color: "text-accent"
  }, {
    title: "Inquiries",
    value: inquiriesData.total,
    icon: MessageSquare,
    color: "text-accent",
    trend: inquiriesData.weeklyNew > 0 ? `+${inquiriesData.weeklyNew} new this week` : null
  }, {
    title: "Alerts",
    value: unreadAlertsCount,
    icon: Bell,
    color: "text-accent"
  }];
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16 bg-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Seller Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Track the performance & Manage your property listings</p>
            </div>
            <Button variant="gold" asChild>
              <Link to="/add-property">
                <Plus className="w-4 h-4 mr-2" />
                Add New Property
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.1
        }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => <Card key={index} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  {'breakdown' in stat && stat.breakdown && stat.breakdown.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.breakdown.map((item, i) => (
                        <span key={item.label}>
                          <span className={item.color}>{item.count} {item.label}</span>
                          {i < stat.breakdown.length - 1 && ', '}
                        </span>
                      ))}
                    </p>
                  )}
                  {'trend' in stat && stat.trend && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      {stat.trend}
                    </p>
                  )}
                </CardContent>
              </Card>)}
          </motion.div>

          {/* Tab List Section */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.15
        }} className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
                <TabsTrigger value="listings" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  My Listings 
                </TabsTrigger>
                <TabsTrigger value="saved" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  Saved 
                </TabsTrigger>
                <TabsTrigger value="visits" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors relative">
                  Visits
                  {pendingVisitsCount > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                      {pendingVisitsCount > 9 ? '9+' : pendingVisitsCount}
                    </Badge>}
                </TabsTrigger>
                <TabsTrigger value="offers" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors relative">
                  Offers
                  {pendingOffersCount > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                      {pendingOffersCount > 9 ? '9+' : pendingOffersCount}
                    </Badge>}
                </TabsTrigger>
                <TabsTrigger value="messages" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors relative">
                  Messages
                  {unreadCount > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>}
                </TabsTrigger>
                <TabsTrigger value="alerts" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors relative">
                  Alerts
                  {unreadAlertsCount > 0 && <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                      {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                    </Badge>}
                </TabsTrigger>
                <TabsTrigger value="bookings" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  <Clipboard className="w-4 h-4 mr-1" />
                  My Bookings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-foreground">
                      Your Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                      </div> : properties.length === 0 ? <div className="text-center py-12">
                        <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No properties yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding your first property listing
                        </p>
                        <Button variant="gold" asChild>
                          <Link to="/add-property">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Property
                          </Link>
                        </Button>
                      </div> : <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Property</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  Inquiries
                                </div>
                              </TableHead>
                              <TableHead>Listed</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {properties.map(property => <TableRow key={property.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                                      {property.images && property.images[0] ? <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 text-muted-foreground" />}
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground line-clamp-1">
                                        {property.title}
                                      </p>
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {property.city}, {property.state}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="capitalize">
                                  {property.property_type}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatPrice(property.price)}
                                  {property.listing_type === "rent" && <span className="text-muted-foreground text-sm">/mo</span>}
                                </TableCell>
                                <TableCell>{getStatusBadge(property.status)}</TableCell>
                                <TableCell>
                                  <span className={propertyInquiries[property.id] > 0 ? "text-primary font-medium" : "text-muted-foreground"}>
                                    {propertyInquiries[property.id] || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(property.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-popover">
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
                                      {/* Only show Change Status for listings that are not under_review or declined */}
                                      {property.status !== 'under_review' && property.status !== 'declined' && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="flex items-center gap-2 cursor-pointer">
                                              <CheckCircle className="w-4 h-4" />
                                              Change Status
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent className="bg-popover">
                                              {/* Users can only set to Active if current status is sold or rented */}
                                              {(property.status === 'sold' || property.status === 'rented') && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'active')} className="flex items-center gap-2 cursor-pointer">
                                                  <Home className="w-4 h-4 text-green-500" />
                                                  Active
                                                </DropdownMenuItem>
                                              )}
                                              {property.status !== 'pending' && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'pending')} className="flex items-center gap-2 cursor-pointer">
                                                  <Clock className="w-4 h-4 text-yellow-500" />
                                                  Pending
                                                </DropdownMenuItem>
                                              )}
                                              {property.status !== 'sold' && (
                                                <DropdownMenuItem onClick={() => openStatusChangeDialog(property.id, property.title, 'sold')} className="flex items-center gap-2 cursor-pointer">
                                                  <CheckCircle className="w-4 h-4 text-red-500" />
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
                                        <AlertDialogTrigger asChild className="bg-primary-foreground">
                                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete "{property.title}"? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(property.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>)}
                          </TableBody>
                        </Table>
                      </div>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="mt-6">
                <Card className="bg-card border-border">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No saved properties</h3>
                      <p className="text-muted-foreground">Properties you save will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="visits" className="mt-6">
                <VisitsTab onDataChange={fetchPendingVisitsCount} />
              </TabsContent>

              <TabsContent value="offers" className="mt-6">
                <OffersTab onDataChange={fetchPendingOffersCount} />
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-display text-xl text-foreground">Messages</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/messages">View All</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {conversations.length === 0 ? <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No messages</h3>
                        <p className="text-muted-foreground">Messages from buyers will appear here</p>
                      </div> : <div className="divide-y divide-border">
                        {conversations.slice(0, 5).map(conv => {
                      const initials = conv.other_user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                      return <Link key={conv.id} to="/messages" className="flex items-center gap-4 py-4 -mx-4 px-4 transition-colors bg-sidebar-foreground">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-foreground truncate">
                                    {conv.other_user?.full_name || 'Unknown User'}
                                  </p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatDistanceToNow(new Date(conv.last_message_at), {
                                addSuffix: true
                              })}
                                  </span>
                                </div>
                                {conv.property && <p className="text-xs text-primary truncate">Re: {conv.property.title}</p>}
                                <p className="text-sm text-muted-foreground truncate">
                                  {conv.last_message?.content || 'No messages yet'}
                                </p>
                              </div>
                              {conv.unread_count && conv.unread_count > 0 && <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                                  {conv.unread_count}
                                </Badge>}
                            </Link>;
                    })}
                      </div>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="mt-6">
                <AlertsTab />
              </TabsContent>

              <TabsContent value="bookings" className="mt-6">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Listing Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of "{statusChangeDialog.propertyTitle}" to <span className="font-semibold capitalize">{statusChangeDialog.newStatus}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}