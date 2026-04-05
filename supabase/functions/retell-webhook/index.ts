import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Retell webhook received:", JSON.stringify(payload).substring(0, 500));

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Retell sends different event types - handle call data
    const event = payload.event;
    const callData = payload.call || payload.data || payload;

    // Build the record from Retell's payload
    const record: Record<string, unknown> = {
      call_id: callData.call_id || callData.id || null,
      caller_number: callData.from_number || callData.caller_number || null,
      callee_number: callData.to_number || callData.callee_number || null,
      call_status: callData.call_status || callData.status || event || null,
      call_type: callData.call_type || null,
      direction: callData.direction || null,
      duration_ms: callData.duration_ms || callData.call_duration_ms || null,
      start_time: callData.start_timestamp ? new Date(callData.start_timestamp).toISOString() : null,
      end_time: callData.end_timestamp ? new Date(callData.end_timestamp).toISOString() : null,
      transcript: callData.transcript || null,
      summary: callData.call_summary || callData.summary || null,
      sentiment: callData.user_sentiment || callData.sentiment || null,
      custom_data: callData.metadata || callData.custom_data || {},
      recording_url: callData.recording_url || null,
      retell_agent_id: callData.agent_id || null,
      metadata: {
        event_type: event,
        raw_payload: payload,
        disconnection_reason: callData.disconnection_reason || null,
        call_analysis: callData.call_analysis || null,
      },
    };

    // Upsert by call_id so we always have the latest state
    if (record.call_id) {
      const { error } = await supabase
        .from("retell_calls")
        .upsert(record, { onConflict: "call_id" });

      if (error) {
        console.error("Error saving call data:", error);
        throw error;
      }
      console.log(`Call ${record.call_id} saved/updated successfully`);
    } else {
      // No call_id, just insert
      const { error } = await supabase
        .from("retell_calls")
        .insert(record);

      if (error) {
        console.error("Error inserting call data:", error);
        throw error;
      }
      console.log("Call data inserted (no call_id)");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in retell-webhook:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
