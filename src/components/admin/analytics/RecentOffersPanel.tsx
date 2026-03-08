import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface RecentOffer {
  id: string;
  offer_amount: number;
  status: string;
  created_at: string;
  property_id: string;
  property_title?: string;
}

const statusVariant: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400' },
  accepted: { label: 'Accepted', className: 'bg-accent/15 text-accent border-accent/30' },
  declined: { label: 'Declined', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  countered: { label: 'Countered', className: 'bg-primary/15 text-primary border-primary/30' },
};

export function RecentOffersPanel() {
  const [offers, setOffers] = useState<RecentOffer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase
        .from('property_offers')
        .select('id, offer_amount, status, created_at, property_id')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!data) return;

      // Fetch property titles
      const propertyIds = [...new Set(data.map((o) => o.property_id))];
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title')
        .in('id', propertyIds);

      const titleMap = new Map(properties?.map((p) => [p.id, p.title]) || []);

      setOffers(
        data.map((o) => ({
          ...o,
          property_title: titleMap.get(o.property_id) || 'Unknown Property',
        }))
      );
    };
    fetchOffers();
  }, []);

  const formatPrice = (price: number) =>
    price >= 1_000_000
      ? `$${(price / 1_000_000).toFixed(1)}M`
      : `$${price.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="h-full border-border/50 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.12)] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Recent Offers</CardTitle>
          <span className="text-xs font-semibold text-accent flex items-center gap-1">
            latest <ArrowRight className="h-3 w-3" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-4">
          {offers.map((offer) => {
            const sv = statusVariant[offer.status] || statusVariant.pending;
            return (
              <div
                key={offer.id}
                className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {offer.property_title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(parseISO(offer.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-foreground">
                    {formatPrice(offer.offer_amount)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sv.className}`}>
                    {sv.label}
                  </span>
                </div>
              </div>
            );
          })}
          {offers.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No offers yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
