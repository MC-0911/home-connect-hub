import { Building2, Users, TrendingUp, DollarSign, Plus, Home, Tag, Clock, Eye, Edit, BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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
}

const viewsData = [
  { day: "Mon", views: 45, inquiries: 12 },
  { day: "Tue", views: 62, inquiries: 18 },
  { day: "Wed", views: 78, inquiries: 15 },
  { day: "Thu", views: 95, inquiries: 22 },
  { day: "Fri", views: 110, inquiries: 19 },
  { day: "Sat", views: 155, inquiries: 25 },
  { day: "Sun", views: 130, inquiries: 20 },
];

const leadSourcesData = [
  { name: "Website", value: 40, color: "hsl(var(--primary))" },
  { name: "Social Media", value: 25, color: "hsl(0, 80%, 60%)" },
  { name: "Referrals", value: 20, color: "hsl(160, 60%, 50%)" },
  { name: "Open House", value: 10, color: "hsl(40, 90%, 55%)" },
  { name: "Other", value: 5, color: "hsl(var(--muted-foreground))" },
];

const mockProperties = [
  { name: "Luxury Villa", address: "123 Palm Street", type: "House", price: "₦850,000", status: "active", views: 234 },
  { name: "Modern Apartment", address: "456 Oak Avenue", type: "Apartment", price: "₦425,000", status: "pending", views: 156 },
  { name: "Beachfront Condo", address: "789 Ocean Drive", type: "Condo", price: "₦650,000", status: "sold", views: 423 },
  { name: "Suburban House", address: "321 Maple Lane", type: "House", price: "₦375,000", status: "active", views: 189 },
];

const mockTasks = [
  { title: "Property Showing - Luxury Villa", time: "Today, 2:00 PM", priority: "high" },
  { title: "Client Meeting - Johnson Family", time: "Tomorrow, 10:30 AM", priority: "medium" },
  { title: "Contract Review - Beachfront Condo", time: "Tomorrow, 3:00 PM", priority: "high" },
  { title: "Property Photography", time: "Wed, 9:00 AM", priority: "low" },
];

const mockClients = [
  { name: "Robert Chen", interest: "Luxury Villa" },
  { name: "Emily Rodriguez", interest: "Modern Apartment" },
  { name: "Michael Thompson", interest: "Suburban House" },
];

const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  sold: "bg-red-100 text-red-700",
  rented: "bg-blue-100 text-blue-700",
};

export function OverviewSection({ stats, recentActivity, onNavigate }: OverviewSectionProps) {
  const navigate = useNavigate();

  const kpis = [
    { label: "Total Properties", value: stats.totalListings || 24, sub: "↑ 12% from last month", icon: Home, gradient: "from-blue-500 to-indigo-600" },
    { label: "Active Listings", value: stats.activeListings || 18, sub: `${Math.floor((stats.activeListings || 8))} for sale, ${Math.floor((stats.activeListings || 10))} for rent`, icon: Tag, gradient: "from-emerald-500 to-teal-600" },
    { label: "Pending Deals", value: stats.totalLeads || 6, sub: `Total value: ₦2.4M`, icon: Clock, gradient: "from-amber-500 to-orange-600" },
    { label: "Total Commission", value: `₦${(stats.monthlyCommission || 142000).toLocaleString()}`, sub: "↑ 8% from last month", icon: DollarSign, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
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
        {/* Line Chart */}
        <Card className="lg:col-span-2 border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Property Views & Inquiries</CardTitle>
              <select className="text-sm border border-border rounded-full px-3 py-1 bg-background text-muted-foreground">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
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

        {/* Pie Chart */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourcesData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadSourcesData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties Table */}
      <Card className="border border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Properties</CardTitle>
            <Button
              onClick={() => navigate("/add-property")}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" /> Add New Property
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Property</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Views</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProperties.map((prop, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <p className="font-semibold text-sm text-foreground">{prop.name}</p>
                      <p className="text-xs text-muted-foreground">{prop.address}</p>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground">{prop.type}</td>
                    <td className="py-3 px-2 text-sm font-medium text-foreground">{prop.price}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[prop.status] || "bg-muted text-muted-foreground"}`}>
                        {prop.status.charAt(0).toUpperCase() + prop.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-foreground">{prop.views}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <button className="text-muted-foreground hover:text-foreground transition-colors"><Edit className="h-4 w-4" /></button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors"><BarChart3 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Row: Tasks + Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Upcoming Tasks */}
        <Card className="lg:col-span-3 border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {mockTasks.map((task, i) => (
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
            ))}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card className="lg:col-span-2 border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {mockClients.map((client, i) => (
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
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
