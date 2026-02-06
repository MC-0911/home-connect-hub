import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ error: "Missing Supabase env vars" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const nowIso = new Date().toISOString();

    // Publish scheduled blogs
    const { data: publishedBlogs, error } = await supabase
      .from("blogs")
      .update({
        status: "published",
        published_at: nowIso,
        publish_at: null,
      })
      .eq("status", "scheduled")
      .lte("publish_at", nowIso)
      .select("id, title, slug");

    if (error) {
      console.error("Failed to publish scheduled blogs:", error);
      return jsonResponse({ error: "Failed to publish scheduled blogs" }, 500);
    }

    const publishedCount = (publishedBlogs || []).length;

    // If blogs were published, notify all admins
    if (publishedCount > 0) {
      // Get all admin user IDs
      const { data: adminRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) {
        console.error("Failed to fetch admin roles:", rolesError);
      } else if (adminRoles && adminRoles.length > 0) {
        // Create alerts for each admin for each published blog
        const alerts = [];
        for (const blog of publishedBlogs || []) {
          for (const admin of adminRoles) {
            alerts.push({
              user_id: admin.user_id,
              title: "Scheduled Post Published",
              message: `"${blog.title}" has been automatically published.`,
              type: "success",
              link: `/blog/${blog.slug}`,
            });
          }
        }

        if (alerts.length > 0) {
          const { error: alertError } = await supabase
            .from("alerts")
            .insert(alerts);

          if (alertError) {
            console.error("Failed to create admin alerts:", alertError);
          } else {
            console.log(`Created ${alerts.length} admin alerts for ${publishedCount} published blogs`);
          }
        }
      }
    }

    return jsonResponse({ success: true, published: publishedCount });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
