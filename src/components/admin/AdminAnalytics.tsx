import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Home, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Eye,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalBlogs: number;
  totalLeads: number;
  activeListings: number;
  newLeadsThisWeek: number;
  listingsByType: { name: string; value: number }[];
  leadsByStatus: { name: string; value: number }[];
}

const COLORS = ['hsl(215, 50%, 23%)', 'hsl(38, 75%, 55%)', 'hsl(215, 40%, 35%)', 'hsl(38, 80%, 65%)', 'hsl(215, 55%, 15%)'];

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalListings: 0,
    totalBlogs: 0,
    totalLeads: 0,
    activeListings: 0,
    newLeadsThisWeek: 0,
    listingsByType: [],
    leadsByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, listingsRes, blogsRes, leadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id, status, property_type', { count: 'exact' }),
          supabase.from('blogs').select('id', { count: 'exact', head: true }),
          supabase.from('buyer_requirements').select('id, created_at, status', { count: 'exact' }),
        ]);

        const activeListings = listingsRes.data?.filter(p => p.status === 'active').length || 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newLeadsThisWeek = leadsRes.data?.filter(
          l => new Date(l.created_at) >= oneWeekAgo
        ).length || 0;

        // Calculate listings by type
        const typeCounts: Record<string, number> = {};
        listingsRes.data?.forEach(l => {
          typeCounts[l.property_type] = (typeCounts[l.property_type] || 0) + 1;
        });
        const listingsByType = Object.entries(typeCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        // Calculate leads by status
        const statusCounts: Record<string, number> = {};
        leadsRes.data?.forEach(l => {
          const status = l.status || 'new';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        const leadsByStatus = Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        }));

        setAnalytics({
          totalUsers: usersRes.count || 0,
          totalListings: listingsRes.count || 0,
          totalBlogs: blogsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          activeListings,
          newLeadsThisWeek,
          listingsByType,
          leadsByStatus,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const stats = [
    { 
      title: 'Total Users', 
      value: analytics.totalUsers, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      trend: '+12%',
      trendUp: true
    },
    { 
      title: 'Total Listings', 
      value: analytics.totalListings, 
      icon: Home, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      trend: '+8%',
      trendUp: true
    },
    { 
      title: 'Active Listings', 
      value: analytics.activeListings, 
      icon: TrendingUp, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      trend: '+5%',
      trendUp: true
    },
    { 
      title: 'Total Blogs', 
      value: analytics.totalBlogs, 
      icon: FileText, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      trend: '+3%',
      trendUp: true
    },
    { 
      title: 'Total Leads', 
      value: analytics.totalLeads, 
      icon: MessageSquare, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      trend: '+15%',
      trendUp: true
    },
    { 
      title: 'New Leads (7 days)', 
      value: analytics.newLeadsThisWeek, 
      icon: Activity, 
      color: 'from-accent to-accent',
      bgColor: 'bg-accent/10',
      trend: analytics.newLeadsThisWeek > 0 ? '+' + analytics.newLeadsThisWeek : '0',
      trendUp: analytics.newLeadsThisWeek > 0
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'currentColor' }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Listings by Property Type</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.listingsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.listingsByType}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="value" fill="hsl(215, 50%, 23%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No listing data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Leads by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Leads by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.leadsByStatus.length > 0 ? (
                <div className="flex items-center justify-center gap-8">
                  <ResponsiveContainer width="50%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.leadsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.leadsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {analytics.leadsByStatus.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground">{entry.name}:</span>
                        <span className="font-medium">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No lead data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}