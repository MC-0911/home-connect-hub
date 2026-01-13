import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Clock, Check, X, MessageSquare, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  buyer?: {
    full_name: string | null;
  };
}

interface OfferCardProps {
  offer: Offer;
  isSeller?: boolean;
  acceptDialogOpen: boolean;
  counterDialogOpen: boolean;
  declineDialogOpen: boolean;
  onAcceptDialogChange: (open: boolean) => void;
  onCounterDialogChange: (open: boolean) => void;
  onDeclineDialogChange: (open: boolean) => void;
  sellerResponse: string;
  counterAmount: string;
  onSellerResponseChange: (value: string) => void;
  onCounterAmountChange: (value: string) => void;
  onAccept: () => void;
  onCounter: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
  onAcceptCounter: () => void;
  onDeclineCounter: () => void;
  formatPrice: (price: number) => string;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    accepted: "default",
    declined: "destructive",
    countered: "outline",
    withdrawn: "outline"
  };
  const colors: Record<string, string> = {
    countered: "border-accent text-accent"
  };
  return <Badge variant={variants[status] || "secondary"} className={`capitalize ${colors[status] || ""}`}>
    {status}
  </Badge>;
};

const OfferCard = ({
  offer,
  isSeller = false,
  acceptDialogOpen,
  counterDialogOpen,
  declineDialogOpen,
  onAcceptDialogChange,
  onCounterDialogChange,
  onDeclineDialogChange,
  sellerResponse,
  counterAmount,
  onSellerResponseChange,
  onCounterAmountChange,
  onAccept,
  onCounter,
  onDecline,
  onWithdraw,
  onAcceptCounter,
  onDeclineCounter,
  formatPrice
}: OfferCardProps) => {
  const priceDiff = offer.property ? (offer.offer_amount - offer.property.price) / offer.property.price * 100 : 0;
  const isCountered = offer.status === "countered";
  const isBuyer = !isSeller;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
            {offer.property?.images?.[0] ? (
              <img src={offer.property.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <DollarSign className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-foreground truncate">{offer.property?.title || "Property"}</h4>
                <p className="text-sm text-muted-foreground">{offer.property?.address}, {offer.property?.city}</p>
                {isSeller && offer.buyer?.full_name && <p className="text-xs text-primary">From: {offer.buyer.full_name}</p>}
              </div>
              {getStatusBadge(offer.status)}
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{isSeller ? "Their Offer" : "Your Offer"}</p>
                <p className={`text-lg font-bold ${isCountered ? "line-through text-muted-foreground" : "text-accent"}`}>
                  {formatPrice(offer.offer_amount)}
                </p>
              </div>
              {isCountered && offer.counter_amount && (
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

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(offer.created_at), { addSuffix: true })}
            </div>

            {offer.message && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                {offer.message}
              </p>
            )}

            {offer.seller_response && <p className="text-sm text-primary mt-1">Seller: {offer.seller_response}</p>}

            {/* Buyer actions for pending offers - withdraw */}
            {isBuyer && offer.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <X className="w-4 h-4 mr-1" /> Withdraw Offer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Withdraw Offer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to withdraw your offer of {formatPrice(offer.offer_amount)} for {offer.property?.title}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onWithdraw}>
                        Withdraw Offer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {/* Buyer actions for countered offers */}
            {isBuyer && isCountered && offer.counter_amount && (
              <div className="flex gap-2 mt-3 p-3 bg-accent/10 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Counter offer received</p>
                  <p className="text-xs text-muted-foreground">The seller has countered with {formatPrice(offer.counter_amount)}</p>
                </div>
                <Button size="sm" onClick={onAcceptCounter}>
                  <Check className="w-4 h-4 mr-1" /> Accept
                </Button>
                <Button size="sm" variant="destructive" onClick={onDeclineCounter}>
                  <X className="w-4 h-4 mr-1" /> Decline
                </Button>
              </div>
            )}

            {/* Seller actions for pending offers */}
            {isSeller && offer.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Dialog open={acceptDialogOpen} onOpenChange={onAcceptDialogChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default">
                      <Check className="w-4 h-4 mr-1" /> Accept
                    </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Accept Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Accept the offer of {formatPrice(offer.offer_amount)} for {offer.property?.title}?
                      </p>
                      <Textarea 
                        placeholder="Add a message to the buyer (optional)" 
                        value={sellerResponse} 
                        onChange={e => onSellerResponseChange(e.target.value)} 
                      />
                      <Button onClick={onAccept} className="w-full">
                        Accept Offer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={counterDialogOpen} onOpenChange={onCounterDialogChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                      <ArrowLeftRight className="w-4 h-4 mr-1" /> Counter
                    </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Make Counter Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-sidebar-foreground">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Their offer:</span>
                          <span className="font-medium">{formatPrice(offer.offer_amount)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">List price:</span>
                          <span className="font-medium">{formatPrice(offer.property?.price || 0)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Your Counter Offer</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="text" 
                            value={counterAmount} 
                            onChange={e => onCounterAmountChange(e.target.value.replace(/[^0-9]/g, ""))} 
                            className="pl-9" 
                            placeholder="Enter your counter amount" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Message (Optional)</Label>
                        <Textarea 
                          placeholder="Explain your counter offer..." 
                          value={sellerResponse} 
                          onChange={e => onSellerResponseChange(e.target.value)} 
                        />
                      </div>
                      <Button onClick={onCounter} disabled={!counterAmount} className="w-full">
                        Send Counter Offer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={declineDialogOpen} onOpenChange={onDeclineDialogChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <X className="w-4 h-4 mr-1" /> Decline
                    </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Decline Offer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Reason for declining (optional)" 
                        value={sellerResponse} 
                        onChange={e => onSellerResponseChange(e.target.value)} 
                      />
                      <Button variant="destructive" onClick={onDecline} className="w-full">
                        Decline Offer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface OffersTabProps {
  onDataChange?: () => void;
}

export function OffersTab({ onDataChange }: OffersTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerResponse, setSellerResponse] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [acceptDialogOpen, setAcceptDialogOpen] = useState<string | null>(null);
  const [counterDialogOpen, setCounterDialogOpen] = useState<string | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOffers();

      const channel = supabase.channel("offers-realtime")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "property_offers",
          filter: `seller_id=eq.${user.id}`
        }, () => {
          fetchOffers();
        })
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "property_offers",
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchOffers();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      const { data: myData, error: myError } = await supabase
        .from("property_offers")
        .select(`*, property:properties(title, address, city, price, images)`)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (myError) throw myError;

      const { data: receivedData, error: receivedError } = await supabase
        .from("property_offers")
        .select(`*, property:properties(title, address, city, price, images)`)
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;

      const receivedWithBuyers = await Promise.all(
        (receivedData || []).map(async offer => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", offer.user_id)
            .maybeSingle();
          return { ...offer, buyer: profile };
        })
      );

      setMyOffers((myData || []) as Offer[]);
      setReceivedOffers(receivedWithBuyers as Offer[]);
    } catch (error: any) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: string, response?: string) => {
    try {
      const updateData: any = { status };
      if (response) updateData.seller_response = response;

      const { error } = await supabase.from("property_offers").update(updateData).eq("id", offerId);
      if (error) throw error;

      toast({ title: "Success", description: `Offer ${status}` });
      fetchOffers();
      onDataChange?.();
      resetDialogState();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const submitCounterOffer = async (offerId: string, amount: number, message?: string) => {
    try {
      const { error } = await supabase
        .from("property_offers")
        .update({
          status: "countered",
          counter_amount: amount,
          seller_response: message || null
        })
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "Counter Offer Sent",
        description: `Counter offer of ${formatPrice(amount)} has been sent to the buyer.`
      });
      fetchOffers();
      onDataChange?.();
      resetDialogState();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const acceptCounterOffer = async (offerId: string, counterAmount: number) => {
    try {
      const { error } = await supabase
        .from("property_offers")
        .update({ status: "accepted", offer_amount: counterAmount })
        .eq("id", offerId);

      if (error) throw error;

      toast({ title: "Counter Offer Accepted", description: "You've accepted the seller's counter offer." });
      fetchOffers();
      onDataChange?.();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetDialogState = () => {
    setAcceptDialogOpen(null);
    setCounterDialogOpen(null);
    setDeclineDialogOpen(null);
    setSellerResponse("");
    setCounterAmount("");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingReceivedCount = receivedOffers.filter(o => o.status === "pending").length;

  return (
    <Tabs defaultValue="my-offers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="my-offers">My Offers ({myOffers.length})</TabsTrigger>
        <TabsTrigger value="received" className="relative">
          Received ({receivedOffers.length})
          {pendingReceivedCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
              {pendingReceivedCount > 9 ? '9+' : pendingReceivedCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-offers">
        {myOffers.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No offers made</h3>
              <p className="text-muted-foreground">Offers you make on properties will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myOffers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                acceptDialogOpen={acceptDialogOpen === offer.id}
                counterDialogOpen={counterDialogOpen === offer.id}
                declineDialogOpen={declineDialogOpen === offer.id}
                onAcceptDialogChange={(open) => {
                  setAcceptDialogOpen(open ? offer.id : null);
                  if (!open) setSellerResponse("");
                }}
                onCounterDialogChange={(open) => {
                  setCounterDialogOpen(open ? offer.id : null);
                  if (!open) { setSellerResponse(""); setCounterAmount(""); }
                }}
                onDeclineDialogChange={(open) => {
                  setDeclineDialogOpen(open ? offer.id : null);
                  if (!open) setSellerResponse("");
                }}
                sellerResponse={sellerResponse}
                counterAmount={counterAmount}
                onSellerResponseChange={setSellerResponse}
                onCounterAmountChange={setCounterAmount}
                onAccept={() => updateOfferStatus(offer.id, "accepted", sellerResponse)}
                onCounter={() => submitCounterOffer(offer.id, parseFloat(counterAmount), sellerResponse)}
                onDecline={() => updateOfferStatus(offer.id, "declined", sellerResponse)}
                onWithdraw={() => updateOfferStatus(offer.id, "withdrawn")}
                onAcceptCounter={() => acceptCounterOffer(offer.id, offer.counter_amount!)}
                onDeclineCounter={() => updateOfferStatus(offer.id, "declined")}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="received">
        {receivedOffers.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No offers received</h3>
              <p className="text-muted-foreground">Offers on your properties will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {receivedOffers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                isSeller
                acceptDialogOpen={acceptDialogOpen === offer.id}
                counterDialogOpen={counterDialogOpen === offer.id}
                declineDialogOpen={declineDialogOpen === offer.id}
                onAcceptDialogChange={(open) => {
                  setAcceptDialogOpen(open ? offer.id : null);
                  if (!open) setSellerResponse("");
                }}
                onCounterDialogChange={(open) => {
                  setCounterDialogOpen(open ? offer.id : null);
                  if (!open) { setSellerResponse(""); setCounterAmount(""); }
                }}
                onDeclineDialogChange={(open) => {
                  setDeclineDialogOpen(open ? offer.id : null);
                  if (!open) setSellerResponse("");
                }}
                sellerResponse={sellerResponse}
                counterAmount={counterAmount}
                onSellerResponseChange={setSellerResponse}
                onCounterAmountChange={setCounterAmount}
                onAccept={() => updateOfferStatus(offer.id, "accepted", sellerResponse)}
                onCounter={() => submitCounterOffer(offer.id, parseFloat(counterAmount), sellerResponse)}
                onDecline={() => updateOfferStatus(offer.id, "declined", sellerResponse)}
                onWithdraw={() => updateOfferStatus(offer.id, "withdrawn")}
                onAcceptCounter={() => acceptCounterOffer(offer.id, offer.counter_amount!)}
                onDeclineCounter={() => updateOfferStatus(offer.id, "declined")}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
