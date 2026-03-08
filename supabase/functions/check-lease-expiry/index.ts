import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get today and dates for 30-day and 7-day warnings
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    // Fetch tenants with leases expiring within 30 days
    const { data: tenants, error } = await supabase
      .from("tenants")
      .select("*")
      .not("lease_end", "is", null)
      .gte("lease_end", formatDate(today))
      .lte("lease_end", formatDate(in30Days));

    if (error) throw error;

    let alertsCreated = 0;

    for (const tenant of tenants ?? []) {
      const leaseEnd = new Date(tenant.lease_end);
      const daysLeft = Math.ceil(
        (leaseEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine urgency
      let alertType = "info";
      let title = "Lease Expiring Soon";
      if (daysLeft <= 7) {
        alertType = "warning";
        title = "Lease Expiring This Week";
      }
      if (daysLeft <= 1) {
        alertType = "destructive";
        title = "Lease Expires Tomorrow";
      }

      // Check if we already sent an alert today for this tenant
      const todayStart = formatDate(today);
      const { data: existing } = await supabase
        .from("alerts")
        .select("id")
        .eq("user_id", tenant.user_id)
        .gte("created_at", `${todayStart}T00:00:00`)
        .ilike("message", `%${tenant.tenant_name}%lease%`)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const message = `${tenant.tenant_name}'s lease for "${tenant.property_name || "Unknown Property"}" expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""} (${tenant.lease_end}).`;

      await supabase.from("alerts").insert({
        user_id: tenant.user_id,
        title,
        message,
        type: alertType,
        link: "/agent-dashboard?section=tenants",
      });

      alertsCreated++;
    }

    return new Response(
      JSON.stringify({ success: true, alertsCreated, tenantsChecked: tenants?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
