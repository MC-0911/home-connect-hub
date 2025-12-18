import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Home, FileText, MessageSquare, TrendingUp, Eye } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalBlogs: number;
  totalLeads: number;
  activeListings: number;
  newLeadsThisWeek: number;
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalListings: 0,
    totalBlogs: 0,
    totalLeads: 0,
    activeListings: 0,
    newLeadsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [usersRes, listingsRes, blogsRes, leadsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('properties').select('id, status', { count: 'exact' }),
          supabase.from('blogs').select('id', { count: 'exact', head: true }),
          supabase.from('buyer_requirements').select('id, created_at', { count: 'exact' }),
        ]);

        const activeListings = listingsRes.data?.filter(p => p.status === 'active').length || 0;
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newLeadsThisWeek = leadsRes.data?.filter(
          l => new Date(l.created_at) >= oneWeekAgo
        ).length || 0;

        setAnalytics({
          totalUsers: usersRes.count || 0,
          totalListings: listingsRes.count || 0,
          totalBlogs: blogsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          activeListings,
          newLeadsThisWeek,
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
    { title: 'Total Users', value: analytics.totalUsers, icon: Users, color: 'text-blue-500' },
    { title: 'Total Listings', value: analytics.totalListings, icon: Home, color: 'text-green-500' },
    { title: 'Active Listings', value: analytics.activeListings, icon: TrendingUp, color: 'text-emerald-500' },
    { title: 'Total Blogs', value: analytics.totalBlogs, icon: FileText, color: 'text-purple-500' },
    { title: 'Total Leads', value: analytics.totalLeads, icon: MessageSquare, color: 'text-orange-500' },
    { title: 'New Leads (7 days)', value: analytics.newLeadsThisWeek, icon: Eye, color: 'text-accent' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
