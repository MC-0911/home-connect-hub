import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Eye, Building2, DollarSign, Users, TrendingUp, Heart, MessageSquare, Bell, MoreVertical } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { VisitsTab } from "@/components/dashboard/VisitsTab";
import { OffersTab } from "@/components/dashboard/OffersTab";
import { AlertsTab } from "@/components/dashboard/AlertsTab";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  const unreadCount = getUnreadCount();
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  useEffect(() => {
    if (user) {
      fetchProperties();
      fetchUnreadAlertsCount();

      // Subscribe to alerts changes
      const channel = supabase.channel("dashboard-alerts").on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "alerts",
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUnreadAlertsCount();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
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
  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      sold: "destructive",
      rented: "outline"
    };
    return <Badge variant={variants[status || "active"] || "default"} className="capitalize">
        {status || "active"}
      </Badge>;
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  };
  const stats = [{
    title: "Total Listings",
    value: properties.length,
    icon: Building2,
    color: "text-accent"
  }, {
    title: "Active Listings",
    value: properties.filter(p => p.status === "active").length,
    icon: TrendingUp,
    color: "text-green-500"
  }, {
    title: "Total Value",
    value: formatPrice(properties.reduce((acc, p) => acc + p.price, 0)),
    icon: DollarSign,
    color: "text-accent"
  }, {
    title: "Pending",
    value: properties.filter(p => p.status === "pending").length,
    icon: Users,
    color: "text-yellow-500"
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
              <p className="mt-1 text-primary">
                Manage your property listings
              </p>
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
                <TabsTrigger value="visits" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  Visits
                </TabsTrigger>
                <TabsTrigger value="offers" className="data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-accent rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                  Offers
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
                <VisitsTab />
              </TabsContent>

              <TabsContent value="offers" className="mt-6">
                <OffersTab />
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
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>;
}