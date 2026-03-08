import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Users, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

interface Appointment {
  id: string;
  title: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
}

const typeConfig: Record<string, { icon: typeof CalendarDays; tagLabel: string }> = {
  'Open House': { icon: CalendarDays, tagLabel: 'open house' },
  'Meeting': { icon: Users, tagLabel: 'meeting' },
  'Virtual Tour': { icon: Video, tagLabel: 'online' },
  'Showing': { icon: CalendarDays, tagLabel: 'showing' },
  'Inspection': { icon: CalendarDays, tagLabel: 'inspection' },
};

export function UpcomingAppointmentsPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('agent_appointments')
        .select('id, title, appointment_date, start_time, end_time, appointment_type')
        .gte('appointment_date', today)
        .eq('status', 'scheduled')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (data) setAppointments(data);
    };
    fetchAppointments();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <Card className="h-full border-border/50 shadow-[0_15px_30px_-12px_hsl(var(--primary)/0.12)] rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Upcoming Appointments</CardTitle>
          <span className="text-xs font-semibold text-accent flex items-center gap-1">
            schedule <ArrowRight className="h-3 w-3" />
          </span>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-4">
          {appointments.map((appt) => {
            const config = typeConfig[appt.appointment_type] || typeConfig['Meeting'];
            const IconComp = config.icon;
            return (
              <div
                key={appt.id}
                className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {appt.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(appt.appointment_date), 'MMM d')}, {appt.start_time}–{appt.end_time}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-accent/15 text-accent border-accent/30 shrink-0">
                  {config.tagLabel}
                </span>
              </div>
            );
          })}
          {appointments.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No upcoming appointments
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
