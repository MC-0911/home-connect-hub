// Mock license verification edge function.
// Validates the caller, then runs a 70% success-rate mock and updates the record.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  verification_id: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      token,
    );
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub;

    const body = (await req.json()) as RequestBody;
    if (!body.verification_id || typeof body.verification_id !== "string") {
      return new Response(
        JSON.stringify({ error: "verification_id required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Service-role client to update the row (RLS allows owner update too).
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: record, error: fetchErr } = await admin
      .from("agent_verifications")
      .select("*")
      .eq("id", body.verification_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr || !record) {
      return new Response(
        JSON.stringify({ error: "Verification record not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Expired license guard
    if (record.license_expiry && new Date(record.license_expiry) < new Date()) {
      await admin
        .from("agent_verifications")
        .update({
          status: "rejected",
          rejection_reason: "License has expired.",
        })
        .eq("id", record.id);
      return new Response(
        JSON.stringify({
          status: "rejected",
          message: "License has expired.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 70% success rate mock; 15% rejected; 15% manual review
    const roll = Math.random();
    let nextStatus: "verified" | "rejected" | "manual_review";
    let message: string;
    let rejection_reason: string | null = null;
    let verified_at: string | null = null;

    if (roll < 0.7) {
      nextStatus = "verified";
      message = "License verified successfully.";
      verified_at = new Date().toISOString();
    } else if (roll < 0.85) {
      nextStatus = "rejected";
      message = "License could not be verified against state records.";
      rejection_reason = "License number not found in state registry.";
    } else {
      nextStatus = "manual_review";
      message = "Submitted for manual review by our team.";
    }

    await admin
      .from("agent_verifications")
      .update({
        status: nextStatus,
        rejection_reason,
        verified_at,
      })
      .eq("id", record.id);

    return new Response(
      JSON.stringify({
        status: nextStatus,
        message,
        license_details: {
          license_number: record.license_number,
          state: record.state,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("verify-agent-license error", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message ?? "Server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
