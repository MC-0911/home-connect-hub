import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  DollarSign, Clock, Check, X, MessageSquare, ArrowLeftRight,
  FileText, AlertCircle, CheckCircle2, XCircle, Timer
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  property_id: string;
  user_id: string;
  seller_id: string;
  offer_amount: number;
  counter_amount: number | null;
  status: string;
  message: string | null;
  seller_response: string | null;
  expires_at: string | null;
  created_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
    price: number;
    images: string[] | null;
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);

const getStatusConfig = (status: string) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock; color: string }> = {
    pending: { variant: "secondary", icon: Timer, color: "text-yellow-500" },
    accepted: { variant: "default", icon: CheckCircle2, color: "text-green-500" },
    declined: { variant: "destructive", icon: XCircle, color: "text-destructive" },
    countered: { variant: "outline", icon: ArrowLeftRight, color: "text-accent" },
    withdrawn: { variant: "outline", icon: X, color: "text-muted-foreground" },
  };
  return map[status] || map.pending;
};

export function BuyerOffersSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    fetchOffers();

    const channel = supabase
      .channel("buyer-offers-realtime")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "property_offers",
        filter: `user_id=eq.${user.id}`
      }, fetchOffers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("property_offers")
        .select("*, property:properties(title, address, city, price, images)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOffers((data || []) as Offer[]);
    } catch (err: any) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const withdrawOffer = async (offerId: string) => {
    try {
      const { error } = await supabase.from("property_offers").update({ status: "withdrawn" }).eq("id", offerId);
      if (error) throw error;
      toast({ title: "Offer Withdrawn", description: "Your offer has been withdrawn." });
      fetchOffers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const acceptCounter = async (offerId: string, amount: number) => {
    try {
      const { error } = await supabase.from("property_offers").update({ status: "accepted", offer_amount: amount }).eq("id", offerId);
      if (error) throw error;
      toast({ title: "Counter Accepted", description: `You accepted the counter offer of ${formatPrice(amount)}.` });
      fetchOffers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const declineCounter = async (offerId: string) => {
    try {
      const { error } = await supabase.from("property_offers").update({ status: "declined" }).eq("id", offerId);
      if (error) throw error;
      toast({ title: "Counter Declined", description: "You declined the counter offer." });
      fetchOffers();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredOffers = activeTab === "all" ? offers : offers.filter(o => o.status === activeTab);

  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === "pending").length,
    accepted: offers.filter(o => o.status === "accepted").length,
    countered: offers.filter(o => o.status === "countered").length,
    declined: offers.filter(o => o.status === "declined").length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Offers", value: stats.total, icon: FileText, color: "text-primary" },
          { label: "Pending", value: stats.pending, icon: Timer, color: "text-yellow-500" },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-green-500" },
          { label: "Countered", value: stats.countered, icon: ArrowLeftRight, color: "text-accent" },
          { label: "Declined", value: stats.declined, icon: XCircle, color: "text-destructive" },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="countered">Countered ({stats.countered})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
          <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOffers.length === 0 ? (
            <Card className="bg-card border-border/50">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground">No offers found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === "all"
                    ? "You haven't made any offers yet. Browse properties to get started."
                    : `No ${activeTab} offers at the moment.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOffers.map(offer => {
                const statusConfig = getStatusConfig(offer.status);
                const priceDiff = offer.property
                  ? ((offer.offer_amount - offer.property.price) / offer.property.price) * 100
                  : 0;

                return (
                  <Card key={offer.id} className="bg-card border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Property Image */}
                        <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                          {offer.property?.images?.[0] ? (
                            <img src={offer.property.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <DollarSign className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-foreground truncate">
                                {offer.property?.title || "Property"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {offer.property?.address}, {offer.property?.city}
                              </p>
                            </div>
                            <Badge variant={statusConfig.variant} className="capitalize shrink-0">
                              {offer.status}
                            </Badge>
                          </div>

                          {/* Pricing */}
                          <div className="mt-3 flex flex-wrap items-center gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Your Offer</p>
                              <p className={`text-lg font-bold ${offer.status === "countered" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {formatPrice(offer.offer_amount)}
                              </p>
                            </div>
                            {offer.status === "countered" && offer.counter_amount && (
                              <div>
                                <p className="text-xs text-accent">Counter Offer</p>
                                <p className="text-lg font-bold text-accent">{formatPrice(offer.counter_amount)}</p>
                              </div>
                            )}
                            {offer.property && (
                              <div>
                                <p className="text-xs text-muted-foreground">List Price</p>
                                <p className="text-sm text-foreground">{formatPrice(offer.property.price)}</p>
                              </div>
                            )}
                            <Badge variant={priceDiff >= 0 ? "default" : "secondary"} className="text-xs">
                              {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(1)}%
                            </Badge>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
                          </div>

                          {offer.message && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              {offer.message}
                            </p>
                          )}

                          {offer.seller_response && (
                            <p className="text-sm text-primary mt-1 line-clamp-1">
                              Seller: {offer.seller_response}
                            </p>
                          )}

                          {/* Actions */}
                          {offer.status === "pending" && (
                            <div className="flex gap-2 mt-3">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <X className="w-4 h-4 mr-1" /> Withdraw
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Withdraw Offer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Withdraw your offer of {formatPrice(offer.offer_amount)} for {offer.property?.title}? This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => withdrawOffer(offer.id)}>Withdraw</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}

                          {offer.status === "countered" && offer.counter_amount && (
                            <div className="flex items-center gap-2 mt-3 p-3 bg-accent/10 rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Counter offer received</p>
                                <p className="text-xs text-muted-foreground">
                                  The seller countered with {formatPrice(offer.counter_amount)}
                                </p>
                              </div>
                              <Button size="sm" onClick={() => acceptCounter(offer.id, offer.counter_amount!)}>
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => declineCounter(offer.id)}>
                                <X className="w-4 h-4 mr-1" /> Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
