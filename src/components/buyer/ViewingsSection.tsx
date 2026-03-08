import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CalendarDays, MapPin, Clock, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export function ViewingsSection() {
  const { user } = useAuth();
  const [viewings, setViewings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchViewings = async () => {
      const { data } = await supabase
        .from("property_visits")
        .select("*, properties(title, city, state, images)")
        .eq("user_id", user.id)
        .order("preferred_date", { ascending: true });
      setViewings(data || []);
      setLoading(false);
    };
    fetchViewings();
  }, [user]);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-bold">Scheduled Viewings</h2>
      </div>

      {viewings.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No viewings scheduled</h3>
          <p className="text-muted-foreground">Browse properties and schedule a viewing to see them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {viewings.map(viewing => (
            <Card key={viewing.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  {viewing.properties?.images?.[0] && (
                    <img src={viewing.properties.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{viewing.properties?.title || "Property"}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{viewing.properties?.city}, {viewing.properties?.state}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-3 w-3" />
                    {format(new Date(viewing.preferred_date), "MMM d, yyyy")} • {viewing.preferred_time}
                  </div>
                  <Badge className={`mt-1 ${statusColor(viewing.status)}`}>
                    {viewing.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
