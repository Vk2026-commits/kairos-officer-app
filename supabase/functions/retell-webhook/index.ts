import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-retell-signature",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Retell webhook received event:", payload.event);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event = payload.event;
    const call = payload.call || {};

    const record: Record<string, unknown> = {
      call_id: call.call_id || null,
      event_type: event,
      call_type: call.call_type || null,
      call_status: call.call_status || null,
      direction: call.direction || null,
      caller_number: call.from_number || null,
      callee_number: call.to_number || null,
      retell_agent_id: call.agent_id || null,
      agent_name: call.agent_name || null,
      agent_version: call.agent_version ?? null,
      duration_ms: call.duration_ms ?? null,
      start_time: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
      end_time: call.end_timestamp ? new Date(call.end_timestamp).toISOString() : null,
      disconnection_reason: call.disconnection_reason || null,
      transcript: call.transcript || null,
      transcript_object: call.transcript_object || [],
      transcript_with_tool_calls: call.transcript_with_tool_calls || [],
      recording_url: call.recording_url || null,
      recording_multi_channel_url: call.recording_multi_channel_url || null,
      public_log_url: call.public_log_url || null,
      call_analysis: call.call_analysis || {},
      call_cost: call.call_cost || {},
      latency: call.latency || {},
      retell_llm_dynamic_variables: call.retell_llm_dynamic_variables || {},
      collected_dynamic_variables: call.collected_dynamic_variables || {},
      transfer_destination: typeof call.transfer_destination === "string"
        ? call.transfer_destination
        : call.transfer_destination?.number || null,
      opt_out_sensitive_data_storage: call.opt_out_sensitive_data_storage ?? false,
      // Extract analysis fields into top-level columns for easy querying
      summary: call.call_analysis?.call_summary || call.call_summary || null,
      sentiment: call.call_analysis?.user_sentiment || call.user_sentiment || null,
      custom_data: call.metadata || {},
      metadata: {
        event_type: event,
        event_timestamp: payload.event_timestamp,
        scrubbed_recording_url: call.scrubbed_recording_url || null,
        scrubbed_recording_multi_channel_url: call.scrubbed_recording_multi_channel_url || null,
        knowledge_base_retrieved_contents_url: call.knowledge_base_retrieved_contents_url || null,
        custom_sip_headers: call.custom_sip_headers || null,
        data_storage_setting: call.data_storage_setting || null,
        transfer_end_timestamp: call.transfer_end_timestamp || null,
        scrubbed_transcript_with_tool_calls: call.scrubbed_transcript_with_tool_calls || null,
      },
    };

    if (record.call_id) {
      // Fetch existing record to merge instead of overwrite
      const { data: existing } = await supabase
        .from("retell_calls")
        .select("*")
        .eq("call_id", record.call_id)
        .maybeSingle();

      if (existing) {
        // Merge: only overwrite fields that have meaningful new values
        const merged: Record<string, unknown> = { ...record };
        for (const [key, value] of Object.entries(merged)) {
          const isEmpty = value === null || value === "" ||
            (typeof value === "object" && value !== null && Object.keys(value as object).length === 0) ||
            (Array.isArray(value) && (value as unknown[]).length === 0);
          const existingVal = (existing as Record<string, unknown>)[key];
          const existingHasValue = existingVal !== null && existingVal !== "" &&
            !(typeof existingVal === "object" && existingVal !== null && !Array.isArray(existingVal) && Object.keys(existingVal as object).length === 0) &&
            !(Array.isArray(existingVal) && (existingVal as unknown[]).length === 0);
          if (isEmpty && existingHasValue) {
            merged[key] = existingVal;
          }
        }
        // Merge metadata objects
        if (typeof existing.metadata === "object" && existing.metadata && typeof merged.metadata === "object" && merged.metadata) {
          merged.metadata = { ...(existing.metadata as Record<string, unknown>), ...(merged.metadata as Record<string, unknown>) };
        }

        const { error } = await supabase
          .from("retell_calls")
          .update(merged)
          .eq("call_id", record.call_id);

        if (error) {
          console.error("Error updating call data:", error);
          throw error;
        }
        console.log(`Call ${record.call_id} merged/updated (event: ${event})`);
      } else {
        const { error } = await supabase
          .from("retell_calls")
          .insert(record);

        if (error) {
          console.error("Error inserting call data:", error);
          throw error;
        }
        console.log(`Call ${record.call_id} inserted (event: ${event})`);
      }
    } else {
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
