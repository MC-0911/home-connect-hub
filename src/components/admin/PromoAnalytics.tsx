import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, MousePointerClick, Percent, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';

type EventRow = {
  id: string;
  offer_id: string | null;
  event_type: string;
  created_at: string;
  device_type: string | null;
};

type Offer = { id: string; title: string };

export function PromoAnalytics() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerFilter, setOfferFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  const fetchData = async () => {
    setLoading(true);
    const fromIso = new Date(fromDate + 'T00:00:00').toISOString();
    const toIso = new Date(toDate + 'T23:59:59').toISOString();

    let q = supabase
      .from('promo_offer_events')
      .select('id, offer_id, event_type, created_at, device_type')
      .gte('created_at', fromIso)
      .lte('created_at', toIso)
      .order('created_at', { ascending: true })
      .limit(10000);
    if (offerFilter !== 'all') q = q.eq('offer_id', offerFilter);

    const [{ data: evs }, { data: ofs }] = await Promise.all([
      q,
      supabase.from('promotional_offers').select('id, title').order('display_order'),
    ]);
    setEvents((evs as EventRow[]) || []);
    setOffers((ofs as Offer[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [offerFilter, fromDate, toDate]);

  const stats = useMemo(() => {
    const impressions = events.filter(e => e.event_type === 'impression').length;
    const clicks = events.filter(e => e.event_type === 'cta_click').length;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    return { impressions, clicks, ctr };
  }, [events]);

  const dailySeries = useMemo(() => {
    const map = new Map<string, { date: string; impressions: number; clicks: number }>();
    for (const e of events) {
      const d = format(parseISO(e.created_at), 'MMM dd');
      const row = map.get(d) || { date: d, impressions: 0, clicks: 0 };
      if (e.event_type === 'impression') row.impressions++;
      else if (e.event_type === 'cta_click') row.clicks++;
      map.set(d, row);
    }
    return Array.from(map.values());
  }, [events]);

  const perOffer = useMemo(() => {
    const map = new Map<string, { offerId: string; title: string; impressions: number; clicks: number }>();
    const titleOf = (id: string | null) => offers.find(o => o.id === id)?.title || (id ? 'Unknown' : 'CTA (no offer)');
    for (const e of events) {
      const key = e.offer_id || 'none';
      const row = map.get(key) || { offerId: key, title: titleOf(e.offer_id), impressions: 0, clicks: 0 };
      if (e.event_type === 'impression') row.impressions++;
      else if (e.event_type === 'cta_click') row.clicks++;
      map.set(key, row);
    }
    return Array.from(map.values())
      .map(r => ({ ...r, ctr: r.impressions > 0 ? (r.clicks / r.impressions) * 100 : 0 }))
      .sort((a, b) => b.impressions - a.impressions);
  }, [events, offers]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-[360px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4 rounded-2xl flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Offer</label>
          <Select value={offerFilter} onValueChange={setOfferFilter}>
            <SelectTrigger className="w-[240px] rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All offers</SelectItem>
              {offers.map(o => <SelectItem key={o.id} value={o.id}>{o.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">From</label>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[170px] rounded-xl" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">To</label>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[170px] rounded-xl" />
        </div>
        <Button variant="outline" onClick={fetchData} className="rounded-xl gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Impressions" value={stats.impressions.toLocaleString()} icon={Eye} />
        <StatCard label="CTA Clicks" value={stats.clicks.toLocaleString()} icon={MousePointerClick} />
        <StatCard label="CTR" value={`${stats.ctr.toFixed(2)}%`} icon={Percent} />
      </div>

      {/* Trend chart */}
      <Card className="p-6 rounded-2xl">
        <h3 className="font-display font-semibold mb-4">Daily Performance</h3>
        <div className="h-[320px]">
          <ResponsiveContainer>
            <LineChart data={dailySeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
              <Legend />
              <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent-foreground))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Per-offer breakdown */}
      <Card className="p-6 rounded-2xl">
        <h3 className="font-display font-semibold mb-4">Performance by Offer</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offer</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perOffer.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No events in this range.</TableCell></TableRow>
            ) : perOffer.map(r => (
              <TableRow key={r.offerId}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell className="text-right">{r.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{r.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{r.ctr.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Eye }) {
  return (
    <Card className="p-5 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-display font-bold">{value}</p>
      </div>
    </Card>
  );
}
