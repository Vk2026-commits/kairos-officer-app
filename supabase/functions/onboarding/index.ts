import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashToken } from "../_shared/privacy.ts";

const headers = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const respond = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  try {
    const { action, token, application } = await req.json();
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
      return respond({ error: "An onboarding invitation is required." }, 403);
    const db = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const tokenHash = await hashToken(token);
    if (action === "validate") {
      const { data, error } = await db
        .from("onboarding_invitations")
        .select("id")
        .eq("token_hash", tokenHash)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      return data
        ? respond({ valid: true })
        : respond(
            {
              error:
                "This invitation has expired or has already been used. Contact the hiring team.",
            },
            403,
          );
    }
    if (action !== "submit" || !application || typeof application !== "object")
      return respond({ error: "Invalid request" }, 400);
    const { data: id, error } = await db.rpc("submit_invited_onboarding", {
      invitation_hash: tokenHash,
      payload: application,
    });
    if (error)
      return respond(
        {
          error:
            "Unable to submit. Check your invitation and use the email address from your employment application. Contact the hiring team if you already submitted.",
        },
        400,
      );
    // Notify with a record ID only; the email function never receives the form.
    let emailSent = false;
    try {
      const { error: emailError } = await db.functions.invoke("send-application-email", {
        body: { id },
      });
      emailSent = !emailError;
    } catch {
      /* The packet is committed; notification failure must not suggest resubmission. */
    }
    // Upload authorization is limited to two fixed paths for the newly saved packet.
    const uploads: Record<string, { path: string; token: string }> = {};
    for (const kind of ["drivers-license", "social-security-card"]) {
      const path = `${id}/${kind}`;
      try {
        const { data, error: uploadError } = await db.storage
          .from("onboarding-documents")
          .createSignedUploadUrl(path);
        if (!uploadError && data) uploads[kind] = { path, token: data.token };
      } catch {
        /* The client reports a missing upload grant without resubmitting. */
      }
    }
    return respond({ id, uploads, emailSent });
  } catch {
    return respond({ error: "Unable to process onboarding. Please contact the hiring team." }, 500);
  }
});
