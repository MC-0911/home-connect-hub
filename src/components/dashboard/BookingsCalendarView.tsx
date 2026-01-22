import { useMemo, useState } from "react";
import { format, isAfter, isSameDay, parseISO, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, FileText } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Booking = {
  id: string;
  service_name: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
};

function safeParseDateOnly(dateStr: string): Date {
  // service_bookings.preferred_date is a DATE in Postgres (YYYY-MM-DD).
  // parseISO keeps it stable vs new Date() timezone shifts.
  return parseISO(dateStr);
}

export function BookingsCalendarView({ bookings }: { bookings: Booking[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(new Date()));

  const upcomingConfirmed = useMemo(() => {
    const today = startOfDay(new Date());
    return bookings
      .filter((b) => b.status === "confirmed")
      .filter((b) => isAfter(safeParseDateOnly(b.preferred_date), today) || isSameDay(safeParseDateOnly(b.preferred_date), today));
  }, [bookings]);

  const confirmedDates = useMemo(() => {
    return upcomingConfirmed.map((b) => safeParseDateOnly(b.preferred_date));
  }, [upcomingConfirmed]);

  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    return upcomingConfirmed
      .filter((b) => isSameDay(safeParseDateOnly(b.preferred_date), selectedDate))
      .sort((a, b) => a.preferred_time.localeCompare(b.preferred_time));
  }, [selectedDate, upcomingConfirmed]);

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-medium text-foreground">Upcoming confirmed appointments</h3>
              <p className="text-sm text-muted-foreground">
                Select a date to see appointment details.
              </p>
            </div>
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {upcomingConfirmed.length} confirmed
            </Badge>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="rounded-lg border border-border bg-background/40 p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                showOutsideDays
                modifiers={{ confirmed: confirmedDates }}
                modifiersClassNames={{
                  confirmed:
                    "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-accent",
                }}
              />
            </div>

            <div className="rounded-lg border border-border bg-background/40 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Select a date"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {selectedBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No confirmed appointments for this date.</p>
                ) : (
                  selectedBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-accent" />
                            <p className="truncate font-medium text-foreground">{b.service_name}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{b.preferred_time}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          confirmed
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
