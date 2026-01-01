import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Check, X, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Visit {
  id: string;
  property_id: string;
  user_id: string;
  seller_id: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  message: string | null;
  seller_notes: string | null;
  created_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
    images: string[] | null;
  };
  buyer?: {
    full_name: string | null;
  };
}

interface VisitsTabProps {
  onDataChange?: () => void;
}

export function VisitsTab({ onDataChange }: VisitsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRequests, setMyRequests] = useState<Visit[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerNotes, setSellerNotes] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVisits();

      // Real-time subscription for visits
      const channel = supabase.channel("visits-realtime")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "property_visits",
          filter: `seller_id=eq.${user.id}`
        }, () => {
          fetchVisits();
        })
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "property_visits",
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchVisits();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchVisits = async () => {
    try {
      // Fetch visits I requested (as buyer)
      const { data: myData, error: myError } = await supabase
        .from("property_visits")
        .select(`
          *,
          property:properties(title, address, city, images)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (myError) throw myError;

      // Fetch visits on my properties (as seller)
      const { data: incomingData, error: incomingError } = await supabase
        .from("property_visits")
        .select(`
          *,
          property:properties(title, address, city, images)
        `)
        .eq("seller_id", user?.id)
        .order("created_at", { ascending: false });

      if (incomingError) throw incomingError;

      // Fetch buyer profiles for incoming visits
      const incomingWithBuyers = await Promise.all(
        (incomingData || []).map(async (visit) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", visit.user_id)
            .maybeSingle();
          return { ...visit, buyer: profile };
        })
      );

      setMyRequests((myData || []) as Visit[]);
      setIncomingRequests(incomingWithBuyers as Visit[]);
    } catch (error: any) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status };
      if (notes) updateData.seller_notes = notes;

      const { error } = await supabase
        .from("property_visits")
        .update(updateData)
        .eq("id", visitId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Visit ${status === "confirmed" ? "confirmed" : status === "declined" ? "declined" : "updated"}`,
      });

      fetchVisits();
      onDataChange?.();
      setConfirmDialogOpen(null);
      setSellerNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      confirmed: "default",
      declined: "destructive",
      completed: "outline",
    };
    return <Badge variant={variants[status] || "secondary"} className="capitalize">{status}</Badge>;
  };

  const VisitCard = ({ visit, isSeller = false }: { visit: Visit; isSeller?: boolean }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
            {visit.property?.images?.[0] ? (
              <img src={visit.property.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <MapPin className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-foreground truncate">{visit.property?.title || "Property"}</h4>
                <p className="text-sm text-muted-foreground">{visit.property?.address}, {visit.property?.city}</p>
              </div>
              {getStatusBadge(visit.status)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {format(new Date(visit.preferred_date), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {visit.preferred_time}
              </span>
            </div>
            {visit.message && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                <MessageSquare className="w-3 h-3 inline mr-1" />
                {visit.message}
              </p>
            )}
            {visit.seller_notes && (
              <p className="text-sm text-primary mt-1">Seller note: {visit.seller_notes}</p>
            )}
            {isSeller && visit.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Dialog open={confirmDialogOpen === visit.id} onOpenChange={(open) => {
                  setConfirmDialogOpen(open ? visit.id : null);
                  if (!open) setSellerNotes("");
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default">
                      <Check className="w-4 h-4 mr-1" /> Confirm
                    </Button>
                  </DialogTrigger>
                  <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                      <DialogTitle>Confirm Visit</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Add a note for the buyer (optional)"
                        value={sellerNotes}
                        onChange={(e) => setSellerNotes(e.target.value)}
                      />
                      <Button onClick={() => updateVisitStatus(visit.id, "confirmed", sellerNotes)} className="w-full">
                        Confirm Visit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="destructive" onClick={() => updateVisitStatus(visit.id, "declined")}>
                  <X className="w-4 h-4 mr-1" /> Decline
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
    <Tabs defaultValue="my-requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="my-requests">My Requests ({myRequests.length})</TabsTrigger>
        <TabsTrigger value="incoming">Incoming ({incomingRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="my-requests">
        {myRequests.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No visit requests</h3>
              <p className="text-muted-foreground">Your scheduled property visits will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myRequests.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="incoming">
        {incomingRequests.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No incoming requests</h3>
              <p className="text-muted-foreground">Visit requests from buyers will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((visit) => (
              <VisitCard key={visit.id} visit={visit} isSeller />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
