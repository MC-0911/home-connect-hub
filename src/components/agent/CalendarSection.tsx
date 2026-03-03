import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

interface CalendarSectionProps {
  appointments: (Tables<"property_visits"> & { property_title?: string; property_location?: string })[];
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

export function CalendarSection({ appointments, onRefresh }: CalendarSectionProps) {
  const upcoming = appointments.filter((a) => new Date(a.preferred_date) >= new Date());
  const past = appointments.filter((a) => new Date(a.preferred_date) < new Date());

  const renderList = (items: typeof appointments, emptyText: string) =>
    items.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-8">{emptyText}</p>
    ) : (
      <div className="space-y-3">
        {items.map((apt) => (
          <div key={apt.id} className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover:shadow-sm transition-shadow">
            <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[56px]">
              <span className="text-xs text-primary font-medium">{format(new Date(apt.preferred_date), "MMM")}</span>
              <span className="text-lg font-bold text-primary">{format(new Date(apt.preferred_date), "d")}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground truncate">{apt.property_title || "Property Visit"}</h4>
                <Badge className={statusColors[apt.status] || statusColors.pending}>{apt.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.preferred_time}</span>
                {apt.property_location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {apt.property_location}</span>
                )}
              </div>
              {apt.message && <p className="text-sm text-muted-foreground mt-1 truncate">{apt.message}</p>}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Appointments ({upcoming.length})
          </CardTitle>
        </CardHeader>
        <CardContent>{renderList(upcoming, "No upcoming appointments")}</CardContent>
      </Card>

      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">Past Appointments ({past.length})</CardTitle>
        </CardHeader>
        <CardContent>{renderList(past, "No past appointments")}</CardContent>
      </Card>
    </div>
  );
}
