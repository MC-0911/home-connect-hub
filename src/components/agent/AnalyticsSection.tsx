import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Eye, Users, Building2, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Stats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalLeads: number;
  totalViews: number;
  monthlyCommission: number;
}

interface AnalyticsSectionProps {
  stats: Stats;
}

const COLORS = ["hsl(228, 76%, 59%)", "hsl(142, 76%, 36%)", "hsl(45, 93%, 47%)", "hsl(0, 84%, 60%)"];

export function AnalyticsSection({ stats }: AnalyticsSectionProps) {
  const performanceData = [
    { name: "Listings", value: stats.totalListings },
    { name: "Active", value: stats.activeListings },
    { name: "Sold", value: stats.soldListings },
    { name: "Leads", value: stats.totalLeads },
  ];

  const conversionRate = stats.totalLeads > 0
    ? Math.round((stats.soldListings / stats.totalLeads) * 100) : 0;

  const pieData = [
    { name: "Active", value: stats.activeListings || 1 },
    { name: "Sold/Rented", value: stats.soldListings || 0 },
    { name: "Other", value: Math.max(0, stats.totalListings - stats.activeListings - stats.soldListings) || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: stats.totalViews, icon: Eye, color: "text-primary" },
          { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "text-success" },
          { label: "Active Leads", value: stats.totalLeads, icon: Users, color: "text-info" },
          { label: "Commission", value: `₦${stats.monthlyCommission.toLocaleString()}`, icon: DollarSign, color: "text-warning" },
        ].map((item) => (
          <Card key={item.label} className="border border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(228, 76%, 59%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Listing Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
