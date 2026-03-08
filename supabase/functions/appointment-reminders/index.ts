import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Parse time strings like "10:00 AM" to hours (24h format)
function parseTimeToHours(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentHours = now.getUTCHours() + now.getUTCMinutes() / 60;

    // Fetch today's agent appointments that haven't had reminders sent
    const { data: appointments, error: apptError } = await supabase
      .from("agent_appointments")
      .select("*")
      .eq("appointment_date", todayStr)
      .eq("reminder_sent", false)
      .in("status", ["scheduled", "confirmed"]);

    if (apptError) {
      console.error("Error fetching appointments:", apptError);
      throw apptError;
    }

    let reminderCount = 0;

    for (const appt of appointments || []) {
      const apptHours = parseTimeToHours(appt.start_time);
      const hoursUntil = apptHours - currentHours;

      // Send reminder if appointment is within 1 hour (but not past)
      if (hoursUntil > 0 && hoursUntil <= 1) {
        // Create in-app alert
        const { error: alertError } = await supabase.from("alerts").insert({
          user_id: appt.user_id,
          title: "Appointment Reminder",
          message: `Your appointment "${appt.title}" (${appt.appointment_type}) starts at ${appt.start_time}. Get ready!`,
          type: "warning",
          link: "/agent-dashboard",
        });

        if (alertError) {
          console.error(`Failed to create alert for appointment ${appt.id}:`, alertError);
          continue;
        }

        // Mark reminder as sent
        await supabase
          .from("agent_appointments")
          .update({ reminder_sent: true })
          .eq("id", appt.id);

        reminderCount++;
      }
    }

    // Also check property visits for today
    const { data: visits, error: visitError } = await supabase
      .from("property_visits")
      .select("*")
      .eq("preferred_date", todayStr)
      .in("status", ["pending", "confirmed"]);

    if (!visitError && visits) {
      for (const visit of visits) {
        const visitHours = parseTimeToHours(visit.preferred_time);
        const hoursUntil = visitHours - currentHours;

        if (hoursUntil > 0 && hoursUntil <= 1) {
          // Check if alert already exists for this visit in the last hour
          const { data: existingAlerts } = await supabase
            .from("alerts")
            .select("id")
            .eq("user_id", visit.seller_id)
            .eq("title", "Visit Reminder")
            .gte("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString())
            .limit(1);

          if (!existingAlerts || existingAlerts.length === 0) {
            await supabase.from("alerts").insert({
              user_id: visit.seller_id,
              title: "Visit Reminder",
              message: `A property visit is scheduled at ${visit.preferred_time} today. Be prepared!`,
              type: "warning",
              link: "/agent-dashboard",
            });
            reminderCount++;
          }
        }
      }
    }

    console.log(`Sent ${reminderCount} appointment reminders`);

    return new Response(JSON.stringify({ success: true, reminders_sent: reminderCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Appointment reminder error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
