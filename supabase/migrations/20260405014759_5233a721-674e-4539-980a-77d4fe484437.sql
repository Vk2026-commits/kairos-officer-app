
CREATE TABLE public.retell_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE,
  caller_number TEXT,
  callee_number TEXT,
  call_status TEXT,
  call_type TEXT,
  direction TEXT,
  duration_ms INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  transcript TEXT,
  summary TEXT,
  sentiment TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  recording_url TEXT,
  retell_agent_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.retell_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow webhook inserts"
ON public.retell_calls
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
