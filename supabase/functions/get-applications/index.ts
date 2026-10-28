import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { redactNumbers, hashToken } from "../_shared/privacy.ts";

const corsHeaders = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Simple admin password check
    const { password, action = "list", applicationId, kind } = await req.json();
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");

    if (!adminPassword || password !== adminPassword) {
      console.log("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const json = (data: unknown, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    if (action === "invite") {
      const { data: applicant, error } = await supabase
        .from("employment_applications")
        .select("id,email")
        .eq("id", applicationId)
        .single();
      if (error || !applicant?.email?.trim())
        return json({ error: "An employment application with an email address is required." }, 400);
      const { data: existing, error: existingError } = await supabase
        .from("applications")
        .select("id")
        .eq("employment_application_id", applicationId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return json({ error: "This applicant has already completed onboarding." }, 409);
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      const { error: inviteError } = await supabase.from("onboarding_invitations").insert({
        employment_application_id: applicationId,
        token_hash: await hashToken(token),
        expires_at: expiresAt,
      });
      if (inviteError) throw inviteError;
      return json({ token, expiresAt });
    }
    if (action === "reveal" || action === "export") {
      const table = kind === "employment" ? "employment_applications" : "applications";
      const { data: application, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", applicationId)
        .single();
      if (error || !application) return json({ error: "Application not found" }, 404);
      if (action === "reveal")
        return json({
          routingNumber:
            application.routing_number || application.full_form_data?.routingNumber || "",
          accountNumber:
            application.account_number || application.full_form_data?.accountNumber || "",
        });
      return json({ application });
    }
    if (action === "documents") {
      const { data: packet, error: packetError } = await supabase
        .from("applications")
        .select("id")
        .eq("id", applicationId)
        .single();
      if (packetError || !packet) return json({ error: "Application not found" }, 404);
      const { data: files, error } = await supabase.storage
        .from("onboarding-documents")
        .list(applicationId);
      if (error) throw error;
      const docs = await Promise.all(
        (files || []).map(async (file) => {
          const { data, error } = await supabase.storage
            .from("onboarding-documents")
            .createSignedUrl(`${applicationId}/${file.name}`, 60);
          if (error) throw error;
          return { name: file.name, url: data.signedUrl };
        }),
      );
      return json({ docs });
    }
    if (action !== "list") return json({ error: "Invalid action" }, 400);

    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }

    const { data: employmentApplications, error: empError } = await supabase
      .from("employment_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (empError) {
      console.error("Error fetching employment applications:", empError);
      throw empError;
    }

    const { data: retellCalls, error: callsError } = await supabase
      .from("retell_calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (callsError) {
      console.error("Error fetching retell calls:", callsError);
      throw callsError;
    }

    console.log(
      `Fetched ${applications?.length || 0} applications, ${employmentApplications?.length || 0} employment applications, ${retellCalls?.length || 0} calls`,
    );

    return new Response(
      JSON.stringify({
        applications: redactNumbers(applications),
        employmentApplications: redactNumbers(employmentApplications),
        retellCalls: redactNumbers(retellCalls),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error: unknown) {
    console.error("Error in get-applications function:", error);
    return new Response(JSON.stringify({ error: "Unable to process admin request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
