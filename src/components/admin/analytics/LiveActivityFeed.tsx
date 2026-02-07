import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Home, UserPlus, DollarSign, CalendarCheck, FileText, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityItem {
  id: string;
  type: 'listing' | 'signup' | 'offer' | 'visit' | 'blog' | 'lead';
  title: string;
  description: string;
  timestamp: string;
}

const ACTIVITY_CONFIG = {
  listing: { icon: Home, color: 'text-success', bg: 'bg-success/10', label: 'New Listing' },
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10', label: 'New Signup' },
  offer: { icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10', label: 'New Offer' },
  visit: { icon: CalendarCheck, color: 'text-info', bg: 'bg-info/10', label: 'Visit Request' },
  blog: { icon: FileText, color: 'text-accent', bg: 'bg-accent/10', label: 'New Blog' },
  lead: { icon: Activity, color: 'text-destructive', bg: 'bg-destructive/10', label: 'New Lead' },
};

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const [listingsRes, profilesRes, offersRes, visitsRes, blogsRes, leadsRes] = await Promise.all([
          supabase.from('properties').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('property_offers').select('id, offer_amount, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('property_visits').select('id, preferred_date, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('blogs').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('buyer_requirements').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(3),
        ]);

        const items: ActivityItem[] = [];

        listingsRes.data?.forEach((l) =>
          items.push({
            id: `listing-${l.id}`,
            type: 'listing',
            title: 'New Listing',
            description: `Property "${l.title}" was listed`,
            timestamp: l.created_at,
          })
        );

        profilesRes.data?.forEach((p) =>
          items.push({
            id: `signup-${p.id}`,
            type: 'signup',
            title: 'New Signup',
            description: `${p.full_name || 'A user'} joined the platform`,
            timestamp: p.created_at,
          })
        );

        offersRes.data?.forEach((o) =>
          items.push({
            id: `offer-${o.id}`,
            type: 'offer',
            title: 'New Offer',
            description: `Offer of $${o.offer_amount?.toLocaleString()} submitted`,
            timestamp: o.created_at,
          })
        );

        visitsRes.data?.forEach((v) =>
          items.push({
            id: `visit-${v.id}`,
            type: 'visit',
            title: 'Visit Request',
            description: `Visit scheduled for ${v.preferred_date}`,
            timestamp: v.created_at,
          })
        );

        blogsRes.data?.forEach((b) =>
          items.push({
            id: `blog-${b.id}`,
            type: 'blog',
            title: 'New Blog',
            description: `"${b.title}" was created`,
            timestamp: b.created_at,
          })
        );

        leadsRes.data?.forEach((l) =>
          items.push({
            id: `lead-${l.id}`,
            type: 'lead',
            title: 'New Lead',
            description: `${l.full_name} submitted requirements`,
            timestamp: l.created_at,
          })
        );

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(items.slice(0, 10));
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();

    // Realtime: refresh feed when key tables change
    const channel = supabase
      .channel('activity-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_offers' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_visits' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blogs' }, () => fetchRecentActivity())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buyer_requirements' }, () => fetchRecentActivity())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Live Activity Feed
          </CardTitle>
          <Badge variant="outline" className="text-[10px] gap-1 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[340px] px-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <AnimatePresence>
              <div className="space-y-1">
                {activities.map((item, index) => {
                  const config = ACTIVITY_CONFIG[item.type];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 py-2.5 border-b border-border/50 last:border-0"
                    >
                      <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{config.label}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
