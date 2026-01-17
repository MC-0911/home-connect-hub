import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Home, 
  FileText, 
  MessageSquare, 
  Eye,
  CalendarIcon,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
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
  AreaChart,
  Area,
} from 'recharts';

interface BlogViewData {
  title: string;
  views: number;
  slug: string;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  newLeadsThisWeek: number;
  totalBlogViews: number;
  listingsByType: { name: string; value: number }[];
  leadsByStatus: { name: string; value: number }[];
  blogViewsData: BlogViewData[];
}

const COLORS = ['hsl(215, 50%, 23%)', 'hsl(38, 75%, 55%)', 'hsl(215, 40%, 35%)', 'hsl(38, 80%, 65%)', 'hsl(215, 55%, 15%)'];

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

type PresetRange = 'all' | '7days' | '30days' | '90days' | 'custom';

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    soldListings: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalLeads: 0,
    newLeads: 0,
    contactedLeads: 0,
    qualifiedLeads: 0,
    newLeadsThisWeek: 0,
    totalBlogViews: 0,
    listingsByType: [],
    leadsByStatus: [],
    blogViewsData: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [presetRange, setPresetRange] = useState<PresetRange>('all');

  const handlePresetChange = (preset: PresetRange) => {
    setPresetRange(preset);
    const today = new Date();
    
    switch (preset) {
      case '7days':
        setDateRange({ from: subDays(today, 7), to: today });
        break;
      case '30days':
        setDateRange({ from: subDays(today, 30), to: today });
        break;
      case '90days':
        setDateRange({ from: subDays(today, 90), to: today });
        break;
      case 'all':
        setDateRange({ from: undefined, to: undefined });
        break;
      case 'custom':
        // Keep current range for custom
        break;
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      setPresetRange('custom');
    }
  };

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setPresetRange('all');
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Build date filter
        const fromDate = dateRange.from ? startOfDay(dateRange.from).toISOString() : null;
        const toDate = dateRange.to ? endOfDay(dateRange.to).toISOString() : null;

        // Fetch users (profiles don't have created_at for filtering, so we filter where applicable)
        let usersQuery = supabase.from('profiles').select('id, is_suspended, created_at', { count: 'exact' });
        if (fromDate) usersQuery = usersQuery.gte('created_at', fromDate);
        if (toDate) usersQuery = usersQuery.lte('created_at', toDate);

        // Fetch listings
        let listingsQuery = supabase.from('properties').select('id, status, property_type, created_at', { count: 'exact' });
        if (fromDate) listingsQuery = listingsQuery.gte('created_at', fromDate);
        if (toDate) listingsQuery = listingsQuery.lte('created_at', toDate);

        // Fetch blogs
        let blogsQuery = supabase.from('blogs').select('id, title, slug, views, status, created_at', { count: 'exact' });
        if (fromDate) blogsQuery = blogsQuery.gte('created_at', fromDate);
        if (toDate) blogsQuery = blogsQuery.lte('created_at', toDate);

        // Fetch leads
        let leadsQuery = supabase.from('buyer_requirements').select('id, created_at, status', { count: 'exact' });
        if (fromDate) leadsQuery = leadsQuery.gte('created_at', fromDate);
        if (toDate) leadsQuery = leadsQuery.lte('created_at', toDate);

        const [usersRes, listingsRes, blogsRes, leadsRes] = await Promise.all([
          usersQuery,
          listingsQuery,
          blogsQuery,
          leadsQuery,
        ]);

        // User breakdown
        const suspendedUsers = usersRes.data?.filter(u => u.is_suspended === true).length || 0;
        const activeUsers = (usersRes.data?.length || 0) - suspendedUsers;

        // Listings breakdown
        const activeListings = listingsRes.data?.filter(p => p.status === 'active').length || 0;
        const pendingListings = listingsRes.data?.filter(p => p.status === 'under_review').length || 0;
        const soldListings = listingsRes.data?.filter(p => p.status === 'sold').length || 0;

        // Blogs breakdown
        const publishedBlogs = blogsRes.data?.filter(b => b.status === 'published').length || 0;
        const draftBlogs = blogsRes.data?.filter(b => b.status === 'draft').length || 0;

        // Leads breakdown
        const newLeads = leadsRes.data?.filter(l => l.status === 'new').length || 0;
        const contactedLeads = leadsRes.data?.filter(l => l.status === 'contacted').length || 0;
        const qualifiedLeads = leadsRes.data?.filter(l => l.status === 'qualified').length || 0;
        
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

        // Calculate blog views data
        const blogViewsData: BlogViewData[] = (blogsRes.data || [])
          .map(b => ({
            title: b.title.length > 20 ? b.title.substring(0, 20) + '...' : b.title,
            views: b.views || 0,
            slug: b.slug,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        const totalBlogViews = (blogsRes.data || []).reduce((sum, b) => sum + (b.views || 0), 0);

        setAnalytics({
          totalUsers: usersRes.data?.length || 0,
          activeUsers,
          suspendedUsers,
          totalListings: listingsRes.data?.length || 0,
          activeListings,
          pendingListings,
          soldListings,
          totalBlogs: blogsRes.data?.length || 0,
          publishedBlogs,
          draftBlogs,
          totalLeads: leadsRes.data?.length || 0,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          newLeadsThisWeek,
          totalBlogViews,
          listingsByType,
          leadsByStatus,
          blogViewsData,
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const stats = [
    { 
      title: 'Total Users', 
      value: analytics.totalUsers, 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      breakdown: [
        { label: 'Active', value: analytics.activeUsers, color: 'text-green-600' },
        { label: 'Suspended', value: analytics.suspendedUsers, color: 'text-red-600' },
      ]
    },
    { 
      title: 'Total Listings', 
      value: analytics.totalListings, 
      icon: Home, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      breakdown: [
        { label: 'Active', value: analytics.activeListings, color: 'text-green-600' },
        { label: 'Pending', value: analytics.pendingListings, color: 'text-amber-600' },
        { label: 'Sold', value: analytics.soldListings, color: 'text-blue-600' },
      ]
    },
    { 
      title: 'Total Blogs', 
      value: analytics.totalBlogs, 
      icon: FileText, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      breakdown: [
        { label: 'Published', value: analytics.publishedBlogs, color: 'text-green-600' },
        { label: 'Draft', value: analytics.draftBlogs, color: 'text-muted-foreground' },
      ]
    },
    { 
      title: 'Total Leads', 
      value: analytics.totalLeads, 
      icon: MessageSquare, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      breakdown: [
        { label: 'New', value: analytics.newLeads, color: 'text-blue-600' },
        { label: 'Contacted', value: analytics.contactedLeads, color: 'text-amber-600' },
        { label: 'Qualified', value: analytics.qualifiedLeads, color: 'text-green-600' },
      ]
    },
    { 
      title: 'Total Blog Views', 
      value: analytics.totalBlogViews, 
      icon: Eye, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      breakdown: []
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
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
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Time' },
            { key: '7days', label: 'Last 7 Days' },
            { key: '30days', label: 'Last 30 Days' },
            { key: '90days', label: 'Last 90 Days' },
          ].map((preset) => (
            <Button
              key={preset.key}
              variant={presetRange === preset.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange(preset.key as PresetRange)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={presetRange === 'custom' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "MMM d, yyyy")
                )
              ) : (
                "Custom Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {(dateRange.from || dateRange.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateFilter}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Clear</span>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
                <div className="text-3xl font-bold mb-2">{stat.value.toLocaleString()}</div>
                {stat.breakdown && stat.breakdown.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {stat.breakdown.map((item) => (
                      <span key={item.label} className={item.color}>
                        {item.value} {item.label.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Blog Views Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5 text-cyan-500" />
              Blog Traffic - Top Performing Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.blogViewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.blogViewsData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                  <XAxis type="number" className="text-xs" />
                  <YAxis 
                    type="category" 
                    dataKey="title" 
                    className="text-xs" 
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [value.toLocaleString() + ' views', 'Views']}
                  />
                  <Bar 
                    dataKey="views" 
                    fill="hsl(187, 85%, 43%)" 
                    radius={[0, 4, 4, 0]}
                    background={{ fill: 'hsl(var(--muted))' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No blog view data available yet</p>
                  <p className="text-sm mt-1">Views will appear as users visit your blog posts</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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