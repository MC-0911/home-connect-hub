import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, Phone, Mail, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Booking {
  id: string;
  service_name: string;
  service_slug: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const getStatusBadge = (status: string) => {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    pending: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    confirmed: { variant: "default", className: "bg-green-500/10 text-green-600 border-green-500/20" },
    completed: { variant: "outline", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    cancelled: { variant: "destructive", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };
  const config = variants[status] || variants.pending;
  return (
    <Badge variant="outline" className={`capitalize ${config.className}`}>
      {status}
    </Badge>
  );
};

const BookingCard = ({ booking }: { booking: Booking }) => (
  <Card className="bg-card border-border">
    <CardContent className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-8 h-8 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">{booking.service_name}</h4>
              <p className="text-sm text-muted-foreground">
                Requested on {format(new Date(booking.created_at), "MMM d, yyyy")}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {format(new Date(booking.preferred_date), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {booking.preferred_time}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {booking.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {booking.email}
            </span>
          </div>
          {booking.message && (
            <p className="text-sm text-muted-foreground mt-2 bg-secondary/50 p-2 rounded">
              <span className="font-medium">Your message:</span> {booking.message}
            </p>
          )}
          {booking.admin_notes && (
            <p className="text-sm text-primary mt-2 bg-primary/5 p-2 rounded">
              <span className="font-medium">Admin response:</span> {booking.admin_notes}
            </p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export function MyBookingsTab() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();

      // Real-time subscription for bookings
      const channel = supabase
        .channel("my-bookings-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "service_bookings",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchBookings();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("service_bookings")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
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

  if (bookings.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No service bookings</h3>
          <p className="text-muted-foreground">
            Your service booking requests will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}
