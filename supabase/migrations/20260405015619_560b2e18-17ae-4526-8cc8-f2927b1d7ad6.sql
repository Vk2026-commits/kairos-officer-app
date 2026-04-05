
ALTER TABLE public.retell_calls
  ADD COLUMN IF NOT EXISTS agent_name TEXT,
  ADD COLUMN IF NOT EXISTS agent_version INTEGER,
  ADD COLUMN IF NOT EXISTS disconnection_reason TEXT,
  ADD COLUMN IF NOT EXISTS transcript_object JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS transcript_with_tool_calls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS call_analysis JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS call_cost JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS latency JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS recording_multi_channel_url TEXT,
  ADD COLUMN IF NOT EXISTS public_log_url TEXT,
  ADD COLUMN IF NOT EXISTS retell_llm_dynamic_variables JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS collected_dynamic_variables JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS transfer_destination TEXT,
  ADD COLUMN IF NOT EXISTS opt_out_sensitive_data_storage BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS event_type TEXT;
