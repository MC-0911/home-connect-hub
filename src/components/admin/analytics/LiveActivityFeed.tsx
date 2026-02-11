import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Home, UserPlus, DollarSign, CalendarCheck, FileText, Activity } from 'lucide-react';
import { formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ActivityDetailModal, type ActivityItemFull } from './ActivityDetailModal';

interface LiveActivityFeedProps {
  fromDate?: Date;
  toDate?: Date;
}

const ACTIVITY_CONFIG = {
  listing: { icon: Home, color: 'text-success', bg: 'bg-success/10', label: 'New Listing' },
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10', label: 'New Signup' },
  offer: { icon: DollarSign, color: 'text-warning', bg: 'bg-warning/10', label: 'New Offer' },
  visit: { icon: CalendarCheck, color: 'text-info', bg: 'bg-info/10', label: 'Visit Request' },
  blog: { icon: FileText, color: 'text-accent', bg: 'bg-accent/10', label: 'New Blog' },
  lead: { icon: Activity, color: 'text-destructive', bg: 'bg-destructive/10', label: 'New Lead' },
};

export function LiveActivityFeed({ fromDate, toDate }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItemFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItemFull | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecentActivity = async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const from = fromDate ? startOfDay(fromDate).toISOString() : null;
        const to = toDate ? endOfDay(toDate).toISOString() : null;

        // Fetch richer data for detail modals
        let listingsQ = supabase.from('properties').select('id, title, property_type, listing_type, price, city, state, bedrooms, bathrooms, square_feet, status, created_at, user_id').order('created_at', { ascending: false });
        let profilesQ = supabase.from('profiles').select('id, user_id, full_name, phone, location, bio, created_at').order('created_at', { ascending: false });
        let offersQ = supabase.from('property_offers').select('id, offer_amount, status, message, counter_amount, expires_at, created_at, user_id, property_id, seller_id').order('created_at', { ascending: false });
        let visitsQ = supabase.from('property_visits').select('id, preferred_date, preferred_time, status, message, seller_notes, created_at, user_id, property_id, seller_id').order('created_at', { ascending: false });
        let blogsQ = supabase.from('blogs').select('id, title, slug, author_name, status, views, excerpt, created_at').order('created_at', { ascending: false });
        let leadsQ = supabase.from('buyer_requirements').select('id, full_name, email, phone, property_type, requirement_type, min_budget, max_budget, min_bedrooms, preferred_locations, status, created_at').order('created_at', { ascending: false });

        if (from) {
          listingsQ = listingsQ.gte('created_at', from);
          profilesQ = profilesQ.gte('created_at', from);
          offersQ = offersQ.gte('created_at', from);
          visitsQ = visitsQ.gte('created_at', from);
          blogsQ = blogsQ.gte('created_at', from);
          leadsQ = leadsQ.gte('created_at', from);
        }
        if (to) {
          listingsQ = listingsQ.lte('created_at', to);
          profilesQ = profilesQ.lte('created_at', to);
          offersQ = offersQ.lte('created_at', to);
          visitsQ = visitsQ.lte('created_at', to);
          blogsQ = blogsQ.lte('created_at', to);
          leadsQ = leadsQ.lte('created_at', to);
        }

        const [listingsRes, profilesRes, offersRes, visitsRes, blogsRes, leadsRes, emailsRes] = await Promise.all([
          listingsQ, profilesQ, offersQ, visitsQ, blogsQ, leadsQ,
          supabase.rpc('get_user_emails'),
        ]);

        const emailMap = new Map<string, string>();
        emailsRes.data?.forEach((e: { user_id: string; email: string }) => emailMap.set(e.user_id, e.email));

        const items: ActivityItemFull[] = [];

        listingsRes.data?.forEach((l) => {
          const ownerProfile = profilesRes.data?.find((p) => p.user_id === l.user_id);
          items.push({
            id: `listing-${l.id}`,
            type: 'listing',
            title: 'New Listing',
            description: `Property "${l.title}" was listed`,
            timestamp: l.created_at,
            metadata: { ...l, entity_id: l.id, owner_name: ownerProfile?.full_name, owner_email: emailMap.get(l.user_id) },
          });
        });

        profilesRes.data?.forEach((p) =>
          items.push({
            id: `signup-${p.id}`,
            type: 'signup',
            title: 'New Signup',
            description: `${p.full_name || 'A user'} joined the platform`,
            timestamp: p.created_at,
            metadata: { ...p, email: emailMap.get(p.user_id) },
          })
        );

        offersRes.data?.forEach((o) => {
          const offerProfile = profilesRes.data?.find((p) => p.user_id === o.user_id);
          const offerProperty = listingsRes.data?.find((l) => l.id === o.property_id);
          const ownerProfile = profilesRes.data?.find((p) => p.user_id === o.seller_id);
          items.push({
            id: `offer-${o.id}`,
            type: 'offer',
            title: 'New Offer',
            description: `Offer of ₦${o.offer_amount?.toLocaleString()} submitted`,
            timestamp: o.created_at,
            metadata: { ...o, buyer_name: offerProfile?.full_name, buyer_email: emailMap.get(o.user_id), property_title: offerProperty?.title, property_location: [offerProperty?.city, offerProperty?.state].filter(Boolean).join(', '), owner_name: ownerProfile?.full_name, owner_email: emailMap.get(o.seller_id) },
          });
        });

        visitsRes.data?.forEach((v) => {
          const visitorProfile = profilesRes.data?.find((p) => p.user_id === v.user_id);
          const visitProperty = listingsRes.data?.find((l) => l.id === v.property_id);
          const ownerProfile = profilesRes.data?.find((p) => p.user_id === v.seller_id);
          items.push({
            id: `visit-${v.id}`,
            type: 'visit',
            title: 'Visit Request',
            description: `Visit scheduled for ${v.preferred_date}`,
            timestamp: v.created_at,
            metadata: {
              ...v,
              visitor_name: visitorProfile?.full_name,
              visitor_email: emailMap.get(v.user_id),
              property_title: visitProperty?.title,
              property_location: [visitProperty?.city, visitProperty?.state].filter(Boolean).join(', '),
              owner_name: ownerProfile?.full_name,
              owner_email: emailMap.get(v.seller_id),
            },
          });
        });

        blogsRes.data?.forEach((b) =>
          items.push({
            id: `blog-${b.id}`,
            type: 'blog',
            title: 'New Blog',
            description: `"${b.title}" was created`,
            timestamp: b.created_at,
            metadata: { ...b },
          })
        );

        leadsRes.data?.forEach((l) =>
          items.push({
            id: `lead-${l.id}`,
            type: 'lead',
            title: 'New Lead',
            description: `${l.full_name} submitted requirements`,
            timestamp: l.created_at,
            metadata: { ...l },
          })
        );

        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(items);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();

    const channel = supabase
      .channel('activity-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'properties' }, () => fetchRecentActivity(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => fetchRecentActivity(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_offers' }, () => fetchRecentActivity(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'property_visits' }, () => fetchRecentActivity(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blogs' }, () => fetchRecentActivity(true))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buyer_requirements' }, () => fetchRecentActivity(true))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fromDate, toDate]);

  const handleActivityClick = (item: ActivityItemFull) => {
    setSelectedActivity(item);
    setModalOpen(true);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Live Activity Feed
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {activities.length} activities
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
                Live
              </Badge>
            </div>
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
                        transition={{ delay: Math.min(index * 0.02, 0.5) }}
                        onClick={() => handleActivityClick(item)}
                        className="flex gap-3 py-2.5 border-b border-border/50 last:border-0 cursor-pointer rounded-md px-1 -mx-1 transition-colors hover:bg-muted/50"
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

      <ActivityDetailModal
        activity={selectedActivity}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
