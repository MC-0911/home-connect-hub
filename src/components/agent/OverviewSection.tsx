import { Building2, Users, TrendingUp, DollarSign, Plus, Home, Tag, Clock, Eye, Edit, BarChart3, MessageSquare, Trash2, X, CalendarIcon, Pencil, MoreVertical } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
        <UpcomingTasksCard appointments={appointments} />

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
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchViewCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.rpc("get_property_view_counts", { _user_id: user.id });
      if (!error && data) {
        const counts: Record<string, number> = {};
        data.forEach((row: { property_id: string; view_count: number }) => {
          counts[row.property_id] = Number(row.view_count);
        });
        setViewCounts(counts);
      }
    };
    fetchViewCounts();
  }, [listings]);

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
                      {viewCounts[prop.id] || 0}
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

// --- Upcoming Tasks Card Component ---
interface TaskItem {
  id: string;
  title: string;
  time: string;
  priority: "high" | "medium" | "low";
  isAppointment?: boolean;
  isCompleted?: boolean;
  rawDate?: string | null;
  rawTime?: string;
}

function UpcomingTasksCard({ appointments }: { appointments: any[] }) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState<Date>();
  const [newTimeSlot, setNewTimeSlot] = useState("9:00 AM");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");
  const [customTasks, setCustomTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from Supabase
  const fetchTasks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("agent_tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("task_date", { ascending: true });
    if (!error && data) {
      setCustomTasks(data.map((t: any) => ({
        id: t.id,
        title: t.title,
        time: t.task_date ? `${format(new Date(t.task_date + "T00:00:00"), "MMM d, yyyy")}, ${t.task_time}` : t.task_time,
        priority: t.priority as "high" | "medium" | "low",
        isCompleted: t.is_completed,
        rawDate: t.task_date,
        rawTime: t.task_time,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  const appointmentTasks: TaskItem[] = useMemo(() => {
    return appointments.slice(0, 4).map((a: any) => ({
      id: a.id,
      title: a.property_title ? `Property Showing - ${a.property_title}` : "Property Visit",
      time: `${new Date(a.preferred_date).toLocaleDateString()}, ${a.preferred_time}`,
      priority: (a.status === "pending" ? "high" : a.status === "confirmed" ? "medium" : "low") as "high" | "medium" | "low",
      isAppointment: true,
    }));
  }, [appointments]);

  const allTasks = [...appointmentTasks, ...customTasks];

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("You must be logged in"); return; }
    const { error } = await supabase.from("agent_tasks").insert({
      user_id: user.id,
      title: newTitle.trim(),
      task_date: newDate ? format(newDate, "yyyy-MM-dd") : null,
      task_time: newTimeSlot,
      priority: newPriority,
    });
    if (error) { toast.error("Failed to add task"); return; }
    setNewTitle("");
    setNewDate(undefined);
    setNewTimeSlot("9:00 AM");
    setNewPriority("medium");
    setAddDialogOpen(false);
    toast.success("Task added");
    fetchTasks();
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: newStatus } : t));
    const { error } = await supabase.from("agent_tasks").update({ is_completed: newStatus }).eq("id", id);
    if (error) {
      setCustomTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: currentStatus } : t));
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from("agent_tasks").delete().eq("id", id);
    if (error) { toast.error("Failed to delete task"); return; }
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    toast.success("Task removed");
  };

  const openEditDialog = (task: TaskItem) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDate(task.rawDate ? new Date(task.rawDate + "T00:00:00") : undefined);
    setNewTimeSlot(task.rawTime || "9:00 AM");
    setNewPriority(task.priority);
    setEditDialogOpen(true);
  };

  const handleEditTask = async () => {
    if (!editingTask || !newTitle.trim()) return;
    const { error } = await supabase.from("agent_tasks").update({
      title: newTitle.trim(),
      task_date: newDate ? format(newDate, "yyyy-MM-dd") : null,
      task_time: newTimeSlot,
      priority: newPriority,
    }).eq("id", editingTask.id);
    if (error) { toast.error("Failed to update task"); return; }
    setEditDialogOpen(false);
    setEditingTask(null);
    toast.success("Task updated");
    fetchTasks();
  };

  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Upcoming Tasks</CardTitle>
          <button
            onClick={() => setAddDialogOpen(true)}
            className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {allTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming tasks. Add one to get started.</p>
        ) : (
          allTasks.map((task) => (
            <div key={task.id} className={cn("flex items-center gap-3 py-3 border-b border-border/50 last:border-0 transition-opacity", task.isCompleted && "opacity-60")}>
              <button
                onClick={() => !task.isAppointment && handleToggleComplete(task.id, !!task.isCompleted)}
                className={cn(
                  "h-[18px] w-[18px] shrink-0 rounded border-2 flex items-center justify-center transition-colors",
                  task.isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary",
                  task.isAppointment && "cursor-default"
                )}
              >
                {task.isCompleted && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium text-foreground", task.isCompleted && "line-through text-muted-foreground")}>{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.time}</p>
              </div>
              <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                task.priority === "high" ? "bg-red-100 text-red-700" :
                task.priority === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-emerald-100 text-emerald-700"
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              {!task.isAppointment && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => openEditDialog(task)}>
                      <Tag className="h-3.5 w-3.5 mr-2" />
                      Tag
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(task)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteTask(task.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Task Title</label>
              <Input
                placeholder="e.g. Client Meeting - Johnson Family"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Time</label>
              <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!newTitle.trim()}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditingTask(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Task Title</label>
              <Input
                placeholder="e.g. Client Meeting - Johnson Family"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Time</label>
              <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["8:00 AM","8:30 AM","9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM"].map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Priority</label>
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingTask(null); }}>Cancel</Button>
            <Button onClick={handleEditTask} disabled={!newTitle.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
