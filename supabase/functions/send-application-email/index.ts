import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Internal notification endpoint: never accept arbitrary form data from a browser.
serve(async (req) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const respond = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers });
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey || req.headers.get("Authorization") !== `Bearer ${serviceKey}`)
    return respond({ error: "Unauthorized" }, 401);
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  try {
    const { id } = await req.json();
    const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data, error } = await db.from("applications").select("id").eq("id", id).single();
    if (error || !data) return respond({ error: "Packet not found" }, 404);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Kairos Security Applications <applications@hiring.kairossecurity.com>",
        to: ["info@vektiss.com"],
        subject: "New Kairos Security onboarding packet",
        text: `A new onboarding packet has been submitted. Packet ID: ${data.id}\nReview it securely at https://apply.kairossecurity.com/admin.`,
      }),
    });
    return respond({ success: response.ok }, response.ok ? 200 : 502);
  } catch {
    return respond({ error: "Unable to send notification" }, 500);
  }
});
