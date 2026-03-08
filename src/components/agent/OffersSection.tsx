import { useEffect, useState } from "react";
import { DollarSign, Clock, CheckCircle2, XCircle, ArrowLeftRight, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { OffersTab } from "@/components/dashboard/OffersTab";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface OffersSectionProps {
  onRefresh?: () => void;
}

interface OfferStats {
  totalReceived: number;
  pending: number;
  accepted: number;
  declined: number;
  countered: number;
  totalValue: number;
}

export function OffersSection({ onRefresh }: OffersSectionProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<OfferStats>({
    totalReceived: 0, pending: 0, accepted: 0, declined: 0, countered: 0, totalValue: 0,
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data } = await supabase
        .from("property_offers")
        .select("status, offer_amount")
        .eq("seller_id", user.id);

      if (data) {
        setStats({
          totalReceived: data.length,
          pending: data.filter((o) => o.status === "pending").length,
          accepted: data.filter((o) => o.status === "accepted").length,
          declined: data.filter((o) => o.status === "declined").length,
          countered: data.filter((o) => o.status === "countered").length,
          totalValue: data.reduce((sum, o) => sum + Number(o.offer_amount), 0),
        });
      }
    };

    fetchStats();

    const channel = supabase
      .channel("offers-stats-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "property_offers", filter: `seller_id=eq.${user.id}` }, fetchStats)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

  const cards = [
    { label: "Total Received", value: stats.totalReceived, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Declined", value: stats.declined, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Countered", value: stats.countered, icon: ArrowLeftRight, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Value", value: formatPrice(stats.totalValue), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Offers</h2>
        <p className="text-muted-foreground">Manage your sent and received property offers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Card key={card.label} className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <OffersTab onDataChange={onRefresh} />
    </div>
  );
}
