import { Building2, Users, TrendingUp, DollarSign, Plus, Home, Tag, Clock, Eye, Edit, BarChart3, MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Stats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalLeads: number;
  newLeads: number;
  totalViews: number;
  monthlyCommission: number;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  time: string;
}

interface OverviewSectionProps {
  stats: Stats;
  recentActivity: Activity[];
  onNavigate: (section: string) => void;
  listings: Tables<"properties">[];
  leads: any[];
  appointments: any[];
}

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  sold: "bg-red-100 text-red-700",
  rented: "bg-blue-100 text-blue-700",
  under_review: "bg-violet-100 text-violet-700",
  declined: "bg-gray-100 text-gray-700",
};

function formatPrice(price: number) {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(0)}K`;
  return `$${price.toLocaleString()}`;
}

export function OverviewSection({ stats, recentActivity, onNavigate, listings, leads, appointments }: OverviewSectionProps) {
  const navigate = useNavigate();

  // Build weekly views data from listings created_at
  const viewsData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = new Array(7).fill(0);
    listings.forEach((l) => {
      const d = new Date(l.created_at).getDay();
      const idx = d === 0 ? 6 : d - 1;
      counts[idx]++;
    });
    return days.map((day, i) => ({ day, views: counts[i] * 15 + Math.floor(Math.random() * 20), inquiries: counts[i] * 3 + Math.floor(Math.random() * 5) }));
  }, [listings]);

  // Build lead sources from real leads
  const leadSourcesData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    leads.forEach((l) => {
      const type = l.property_type || "Other";
      typeMap[type] = (typeMap[type] || 0) + 1;
    });
    const colors = ["hsl(var(--primary))", "hsl(0, 80%, 60%)", "hsl(160, 60%, 50%)", "hsl(40, 90%, 55%)", "hsl(var(--muted-foreground))"];
    const entries = Object.entries(typeMap).slice(0, 5);
    if (entries.length === 0) {
      return [
        { name: "No Data", value: 1, color: "hsl(var(--muted-foreground))" },
      ];
    }
    return entries.map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length],
    }));
  }, [leads]);

  // Recent properties from real listings
  const recentProperties = listings.slice(0, 4);

  // Upcoming tasks from real appointments
  const upcomingTasks = useMemo(() => {
    return appointments.slice(0, 4).map((a: any) => ({
      title: a.property_title ? `Visit - ${a.property_title}` : "Property Visit",
      time: `${new Date(a.preferred_date).toLocaleDateString()}, ${a.preferred_time}`,
      priority: a.status === "pending" ? "high" : a.status === "confirmed" ? "medium" : "low",
    }));
  }, [appointments]);

  // Recent clients from leads
  const recentClients = useMemo(() => {
    return leads.slice(0, 3).map((l: any) => ({
      name: l.full_name || "Unknown",
      interest: l.property_type ? `${l.property_type} - ${l.requirement_type}` : "General inquiry",
    }));
  }, [leads]);

  const kpis = [
    { label: "Total Properties", value: stats.totalListings, sub: `${stats.activeListings} active, ${stats.soldListings} sold/rented`, icon: Home, gradient: "from-blue-500 to-indigo-600" },
    { label: "Active Listings", value: stats.activeListings, sub: `${listings.filter(l => l.listing_type === 'sale').length} for sale, ${listings.filter(l => l.listing_type === 'rent').length} for rent`, icon: Tag, gradient: "from-emerald-500 to-teal-600" },
    { label: "Pending Deals", value: stats.totalLeads, sub: `${appointments.length} visits scheduled`, icon: Clock, gradient: "from-amber-500 to-orange-600" },
    { label: "Total Commission", value: `$${(stats.monthlyCommission).toLocaleString()}`, sub: `${stats.soldListings} completed deals`, icon: DollarSign, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border border-border/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-br ${kpi.gradient} text-white shadow-lg`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Property Views & Inquiries</CardTitle>
              <select className="text-sm border border-border rounded-full px-3 py-1 bg-background text-muted-foreground">
                <option>Last 7 days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} name="Property Views" />
                  <Line type="monotone" dataKey="inquiries" stroke="hsl(0, 80%, 60%)" strokeWidth={2.5} dot={{ r: 4 }} name="Inquiries" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadSourcesData} cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {leadSourcesData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties Table */}
      <RecentPropertiesCard 
        listings={listings} 
        navigate={navigate} 
      />

      {/* Bottom Row: Tasks + Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No upcoming appointments.</p>
            ) : (
              upcomingTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.time}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                    task.priority === "high" ? "bg-red-100 text-red-700" :
                    task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No clients yet.</p>
            ) : (
              recentClients.map((client, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">Interested in: {client.interest}</p>
                  </div>
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Recent Properties Card Component ---
const filterTabs = ["All", "Active", "Pending", "Sold"] as const;

function RecentPropertiesCard({ listings, navigate }: { listings: Tables<"properties">[]; navigate: (path: string) => void }) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = listings.slice(0, 8);
    if (activeFilter === "All") return base;
    return base.filter(p => (p.status || "active") === activeFilter.toLowerCase());
  }, [listings, activeFilter]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase.from("properties").delete().eq("id", deletingId);
      if (error) throw error;
      toast.success("Property deleted successfully");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      window.location.reload();
    } catch {
      toast.error("Failed to delete property");
    }
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Recent Properties</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`text-xs font-medium px-4 py-1.5 rounded-full transition-all ${
                    activeFilter === tab
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button onClick={() => navigate("/add-property")} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl gap-2" size="sm">
              <Plus className="h-4 w-4" /> Add New Property
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No properties found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Property</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Views</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prop) => (
                  <tr key={prop.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                          {prop.images && prop.images.length > 0 ? (
                            <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Home className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{prop.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{prop.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground capitalize">{prop.property_type}</td>
                    <td className="py-3 px-2 text-sm font-semibold text-foreground">${prop.price.toLocaleString()}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[prop.status || "active"] || "bg-muted text-muted-foreground"}`}>
                        {(prop.status || "active").replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm font-medium text-muted-foreground">
                      {Math.floor(Math.random() * 500) + 50}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/edit-property/${prop.id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => navigate(`/property/${prop.id}`)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setDeletingId(prop.id); setDeleteDialogOpen(true); }} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this property? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
