import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Clock, Check, X, MessageSquare, ArrowLeftRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

export function OffersTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myOffers, setMyOffers] = useState<Offer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerResponse, setSellerResponse] = useState("");
  const [counterAmount, setCounterAmount] = useState("");

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      // Fetch offers I made (as buyer)
      const { data: myData, error: myError } = await supabase
        .from("property_offers")
        .select(`
          *,
          property:properties(title, address, city, price, images)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (myError) throw myError;

      // Fetch offers on my properties (as seller)
      const { data: receivedData, error: receivedError } = await supabase
        .from("property_offers")
        .select(`
          *,
          property:properties(title, address, city, price, images)
        `)
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (receivedError) throw receivedError;

      // Fetch buyer profiles for received offers
      const receivedWithBuyers = await Promise.all(
        (receivedData || []).map(async (offer) => {
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

      const { error } = await supabase
        .from("property_offers")
        .update(updateData)
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Offer ${status}`,
      });

      fetchOffers();
      setSellerResponse("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const submitCounterOffer = async (offerId: string, amount: number, message?: string) => {
    try {
      const { error } = await supabase
        .from("property_offers")
        .update({
          status: "countered",
          counter_amount: amount,
          seller_response: message || null,
        })
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "Counter Offer Sent",
        description: `Counter offer of ${formatPrice(amount)} has been sent to the buyer.`,
      });

      fetchOffers();
      setCounterAmount("");
      setSellerResponse("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const acceptCounterOffer = async (offerId: string, counterAmount: number) => {
    try {
      const { error } = await supabase
        .from("property_offers")
        .update({
          status: "accepted",
          offer_amount: counterAmount,
        })
        .eq("id", offerId);

      if (error) throw error;

      toast({
        title: "Counter Offer Accepted",
        description: "You've accepted the seller's counter offer.",
      });

      fetchOffers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      accepted: "default",
      declined: "destructive",
      countered: "outline",
      withdrawn: "outline",
    };
    const colors: Record<string, string> = {
      countered: "border-accent text-accent",
    };
    return (
      <Badge 
        variant={variants[status] || "secondary"} 
        className={`capitalize ${colors[status] || ""}`}
      >
        {status}
      </Badge>
    );
  };

  const OfferCard = ({ offer, isSeller = false }: { offer: Offer; isSeller?: boolean }) => {
    const priceDiff = offer.property ? ((offer.offer_amount - offer.property.price) / offer.property.price) * 100 : 0;
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
                  {isSeller && offer.buyer?.full_name && (
                    <p className="text-xs text-primary">From: {offer.buyer.full_name}</p>
                  )}
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

              {offer.seller_response && (
                <p className="text-sm text-primary mt-1">Seller: {offer.seller_response}</p>
              )}

              {/* Buyer actions for countered offers */}
              {isBuyer && isCountered && offer.counter_amount && (
                <div className="flex gap-2 mt-3 p-3 bg-accent/10 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Counter offer received</p>
                    <p className="text-xs text-muted-foreground">The seller has countered with {formatPrice(offer.counter_amount)}</p>
                  </div>
                  <Button size="sm" onClick={() => acceptCounterOffer(offer.id, offer.counter_amount!)}>
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateOfferStatus(offer.id, "declined")}>
                    <X className="w-4 h-4 mr-1" /> Decline
                  </Button>
                </div>
              )}

              {/* Seller actions for pending offers */}
              {isSeller && offer.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="default">
                        <Check className="w-4 h-4 mr-1" /> Accept
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                          onChange={(e) => setSellerResponse(e.target.value)}
                        />
                        <Button onClick={() => updateOfferStatus(offer.id, "accepted", sellerResponse)} className="w-full">
                          Accept Offer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                        <ArrowLeftRight className="w-4 h-4 mr-1" /> Counter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make Counter Offer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-3 bg-secondary rounded-lg">
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
                              onChange={(e) => setCounterAmount(e.target.value.replace(/[^0-9]/g, ""))}
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
                            onChange={(e) => setSellerResponse(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={() => submitCounterOffer(offer.id, parseFloat(counterAmount), sellerResponse)} 
                          disabled={!counterAmount}
                          className="w-full"
                        >
                          Send Counter Offer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <X className="w-4 h-4 mr-1" /> Decline
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Decline Offer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Reason for declining (optional)"
                          value={sellerResponse}
                          onChange={(e) => setSellerResponse(e.target.value)}
                        />
                        <Button 
                          variant="destructive"
                          onClick={() => updateOfferStatus(offer.id, "declined", sellerResponse)} 
                          className="w-full"
                        >
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

  return (
    <Tabs defaultValue="my-offers" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="my-offers">My Offers ({myOffers.length})</TabsTrigger>
        <TabsTrigger value="received">Received ({receivedOffers.length})</TabsTrigger>
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
            {myOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
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
            {receivedOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} isSeller />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
