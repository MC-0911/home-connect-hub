import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface CalendarSectionProps {
  appointments: (Tables<"property_visits"> & { property_title?: string; property_location?: string })[];
  onRefresh: () => void;
}

interface AgentAppointment {
  id: string;
  title: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  status: string;
  appointment_date: string;
  user_id: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-muted text-muted-foreground border-border",
};

const timeSlots = [
  "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  "5:00 PM", "5:30 PM", "6:00 PM",
];

export function CalendarSection({ appointments, onRefresh }: CalendarSectionProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [agentAppts, setAgentAppts] = useState<AgentAppointment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<AgentAppointment | null>(null);
  const [form, setForm] = useState({
    title: "",
    appointment_type: "Meeting",
    start_time: "10:00 AM",
    end_time: "11:00 AM",
    notes: "",
    status: "scheduled",
  });

  const fetchAppts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("agent_appointments")
      .select("*")
      .eq("user_id", user.id)
      .order("appointment_date", { ascending: true });
    if (data) setAgentAppts(data as AgentAppointment[]);
  };

  useEffect(() => {
    fetchAppts();
    if (!user) return;
    const channel = supabase
      .channel("agent-appointments-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_appointments", filter: `user_id=eq.${user.id}` }, fetchAppts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const resetForm = () => {
    setForm({ title: "", appointment_type: "Meeting", start_time: "10:00 AM", end_time: "11:00 AM", notes: "", status: "scheduled" });
    setEditingAppt(null);
  };

  const openNewDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (appt: AgentAppointment) => {
    setEditingAppt(appt);
    setForm({
      title: appt.title,
      appointment_type: appt.appointment_type,
      start_time: appt.start_time,
      end_time: appt.end_time,
      notes: appt.notes || "",
      status: appt.status,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = {
      user_id: user.id,
      title: form.title,
      appointment_type: form.appointment_type,
      start_time: form.start_time,
      end_time: form.end_time,
      notes: form.notes || null,
      status: form.status,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
    };

    if (editingAppt) {
      const { error } = await supabase.from("agent_appointments").update(payload).eq("id", editingAppt.id);
      if (error) { toast.error("Failed to update appointment"); return; }
      toast.success("Appointment updated");
    } else {
      const { error } = await supabase.from("agent_appointments").insert(payload);
      if (error) { toast.error("Failed to create appointment"); return; }
      toast.success("Appointment created");
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("agent_appointments").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else toast.success("Appointment deleted");
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("agent_appointments").update({ status }).eq("id", id);
    if (error) toast.error("Failed to update status");
  };

  // Combine property visits + agent appointments for selected date
  const dayVisits = appointments.filter((a) => isSameDay(new Date(a.preferred_date), selectedDate));
  const dayAgentAppts = agentAppts.filter((a) => isSameDay(new Date(a.appointment_date), selectedDate));

  // Dates that have appointments (for calendar dots)
  const appointmentDates = [
    ...appointments.map((a) => new Date(a.preferred_date)),
    ...agentAppts.map((a) => new Date(a.appointment_date)),
  ];

  const totalToday = dayVisits.length + dayAgentAppts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your schedule and appointments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" /> Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="p-0 pointer-events-auto"
              modifiers={{ hasAppointment: appointmentDates }}
              modifiersClassNames={{ hasAppointment: "font-bold text-primary" }}
            />
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <Button className="w-full mt-4 rounded-xl gap-2" onClick={openNewDialog}>
                <Plus className="h-4 w-4" /> New Appointment
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAppt ? "Edit Appointment" : "New Appointment"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Title *</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Client meeting" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={form.appointment_type} onValueChange={(v) => setForm({ ...form, appointment_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Property Showing">Property Showing</SelectItem>
                        <SelectItem value="Inspection">Inspection</SelectItem>
                        <SelectItem value="Signing">Signing</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Start Time</Label>
                      <Select value={form.start_time} onValueChange={(v) => setForm({ ...form, start_time: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>End Time</Label>
                      <Select value={form.end_time} onValueChange={(v) => setForm({ ...form, end_time: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Date</Label>
                    <Input type="date" value={format(selectedDate, "yyyy-MM-dd")} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Notes</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional details..." rows={3} />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingAppt ? "Save Changes" : "Create Appointment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Day Schedule */}
        <Card className="border border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              {isSameDay(selectedDate, new Date()) ? "Today's" : format(selectedDate, "MMMM d")} Schedule
            </CardTitle>
            <p className="text-sm text-muted-foreground">{totalToday} appointment(s)</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalToday === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">No appointments for this day</p>
            ) : (
              <>
                {/* Agent custom appointments */}
                {dayAgentAppts.map((appt, i) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{appt.title}</h4>
                        <Badge className={cn("text-[11px]", statusColors[appt.status] || statusColors.scheduled)}>
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{appt.appointment_type}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        {appt.start_time} - {appt.end_time}
                      </div>
                      {appt.notes && <p className="text-sm text-muted-foreground mt-1 truncate">{appt.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={appt.status} onValueChange={(v) => handleStatusChange(appt.id, v)}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(appt)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(appt.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}

                {/* Property visit requests */}
                {dayVisits.map((apt, i) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (dayAgentAppts.length + i) * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-foreground">{apt.property_title || "Property Visit"}</h4>
                        <Badge className={cn("text-[11px]", statusColors[apt.status] || statusColors.pending)}>
                          {apt.status}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">Visit Request</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                        <Clock className="h-3.5 w-3.5" /> {apt.preferred_time}
                      </div>
                      {apt.message && <p className="text-sm text-muted-foreground mt-1 truncate">{apt.message}</p>}
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All upcoming */}
      <Card className="border border-border/50">
        <CardHeader>
          <CardTitle className="text-base">All Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const upcoming = [
              ...agentAppts
                .filter((a) => new Date(a.appointment_date) >= new Date())
                .map((a) => ({ id: a.id, title: a.title, date: a.appointment_date, time: `${a.start_time} - ${a.end_time}`, status: a.status, type: a.appointment_type })),
              ...appointments
                .filter((a) => new Date(a.preferred_date) >= new Date())
                .map((a) => ({ id: a.id, title: a.property_title || "Property Visit", date: a.preferred_date, time: a.preferred_time, status: a.status, type: "Visit Request" })),
            ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            if (upcoming.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No upcoming appointments</p>;

            return (
              <div className="space-y-2">
                {upcoming.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[48px]">
                        <p className="text-xs text-primary font-medium">{format(new Date(item.date), "MMM")}</p>
                        <p className="text-lg font-bold text-foreground">{format(new Date(item.date), "d")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.type} · {item.time}</p>
                      </div>
                    </div>
                    <Badge className={cn("text-[11px]", statusColors[item.status] || statusColors.scheduled)}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
