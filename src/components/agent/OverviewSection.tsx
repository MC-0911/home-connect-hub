import { Building2, Users, TrendingUp, DollarSign, Plus, MessageSquare, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

export function OverviewSection({ stats, recentActivity, onNavigate }: OverviewSectionProps) {
  const navigate = useNavigate();
  const kpis = [
    { label: "Total Listings", value: stats.totalListings, icon: Building2, color: "text-primary" },
    { label: "Active Leads", value: stats.totalLeads, icon: Users, color: "text-success" },
    { label: "Conversions", value: stats.soldListings, icon: TrendingUp, color: "text-info" },
    { label: "Monthly Commission", value: `₦${stats.monthlyCommission.toLocaleString()}`, icon: DollarSign, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" onClick={() => navigate("/add-property")}>
              <Plus className="h-4 w-4" /> Add New Property
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => onNavigate("leads")}>
              <MessageSquare className="h-4 w-4" /> Respond to Inquiry
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => onNavigate("calendar")}>
              <Clock className="h-4 w-4" /> View Appointments
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => onNavigate("analytics")}>
              <Eye className="h-4 w-4" /> View Reports
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No recent activity yet</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                      {activity.type === "lead" && <Users className="h-3.5 w-3.5" />}
                      {activity.type === "visit" && <Clock className="h-3.5 w-3.5" />}
                      {activity.type === "offer" && <DollarSign className="h-3.5 w-3.5" />}
                      {activity.type === "listing" && <Building2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
