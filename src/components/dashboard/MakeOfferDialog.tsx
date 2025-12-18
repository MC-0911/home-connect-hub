import { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  sellerId: string;
  propertyTitle: string;
  listPrice: number;
}

export function MakeOfferDialog({ 
  open, 
  onOpenChange, 
  propertyId, 
  sellerId, 
  propertyTitle,
  listPrice
}: MakeOfferDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [offerAmount, setOfferAmount] = useState<string>(listPrice.toString());
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async () => {
    if (!offerAmount || !user) return;

    const amount = parseFloat(offerAmount.replace(/,/g, ""));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid offer amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("property_offers")
        .insert({
          property_id: propertyId,
          user_id: user.id,
          seller_id: sellerId,
          offer_amount: amount,
          message: message || null,
        });

      if (error) throw error;

      toast({
        title: "Offer Submitted",
        description: "Your offer has been sent to the seller.",
      });

      onOpenChange(false);
      setOfferAmount(listPrice.toString());
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const priceDiff = ((parseFloat(offerAmount.replace(/,/g, "")) - listPrice) / listPrice) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Submit an offer for <span className="font-medium text-foreground">{propertyTitle}</span>
          </p>

          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-xs text-muted-foreground">List Price</p>
            <p className="text-lg font-bold text-foreground">{formatPrice(listPrice)}</p>
          </div>

          <div className="space-y-2">
            <Label>Your Offer</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value.replace(/[^0-9,]/g, ""))}
                className="pl-9"
                placeholder="Enter amount"
              />
            </div>
            {!isNaN(priceDiff) && (
              <p className={`text-xs ${priceDiff >= 0 ? "text-green-500" : "text-yellow-500"}`}>
                {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(1)}% {priceDiff >= 0 ? "above" : "below"} list price
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Message (Optional)</Label>
            <Textarea
              placeholder="Why should the seller accept your offer?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!offerAmount || loading}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit Offer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
