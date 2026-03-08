import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface LatestListing {
  id: string;
  title: string;
  property_type: string;
  price: number;
  status: string;
  created_at: string;
  city: string;
  state: string;
}

const statusVariant: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-accent/15 text-accent border-accent/30' },
  under_review: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400' },
  sold: { label: 'Sold', className: 'bg-primary/15 text-primary border-primary/30' },
  rented: { label: 'Rented', className: 'bg-primary/15 text-primary border-primary/30' },
  pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400' },
  declined: { label: 'Declined', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function LatestListingsTable() {
  const [listings, setListings] = useState<LatestListing[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, property_type, price, status, created_at, city, state')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setListings(data as LatestListing[]);
    };
    fetch();
  }, []);

  const formatPrice = (price: number) =>
    price >= 1_000_000
      ? `$${(price / 1_000_000).toFixed(1)}M`
      : `$${price.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-border/50 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.12)] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Latest Property Listings</CardTitle>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            manage <ArrowRight className="h-3 w-3" />
          </button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3">Property</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Listed</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => {
                const sv = statusVariant[listing.status || 'active'] || statusVariant.active;
                return (
                  <tr
                    key={listing.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/property/${listing.id}`)}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Home className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{listing.title}</p>
                          <p className="text-xs text-muted-foreground">{listing.city}, {listing.state}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-foreground capitalize">{listing.property_type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-semibold text-foreground">{formatPrice(listing.price)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sv.className}`}>
                        {sv.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(listing.created_at), { addSuffix: true })}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    No listings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
