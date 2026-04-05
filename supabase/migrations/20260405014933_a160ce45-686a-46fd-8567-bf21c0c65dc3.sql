
CREATE POLICY "Service role can update retell_calls"
ON public.retell_calls
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can select retell_calls"
ON public.retell_calls
FOR SELECT
TO service_role
USING (true);
