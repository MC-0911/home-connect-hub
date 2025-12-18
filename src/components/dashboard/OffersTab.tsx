import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { DollarSign, Clock, Check, X, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Offer {
  id: string;
  property_id: string;
  user_id: string;
  seller_id: string;
  offer_amount: number;
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
    return <Badge variant={variants[status] || "secondary"} className="capitalize">{status}</Badge>;
  };

  const OfferCard = ({ offer, isSeller = false }: { offer: Offer; isSeller?: boolean }) => {
    const priceDiff = offer.property ? ((offer.offer_amount - offer.property.price) / offer.property.price) * 100 : 0;

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
                </div>
                {getStatusBadge(offer.status)}
              </div>
              
              <div className="mt-3 flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Your Offer</p>
                  <p className="text-lg font-bold text-accent">{formatPrice(offer.offer_amount)}</p>
                </div>
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
                <p className="text-sm text-primary mt-1">Seller response: {offer.seller_response}</p>
              )}

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
