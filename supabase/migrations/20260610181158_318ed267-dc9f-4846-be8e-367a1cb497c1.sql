BEGIN;

DROP POLICY IF EXISTS "Anyone can submit cost estimates" ON public.cost_estimates;
CREATE POLICY "Anyone can submit cost estimates"
  ON public.cost_estimates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    area > 0
    AND length(property_type) > 0
    AND length(coalesce(contact_name, '')) > 0
    AND length(coalesce(contact_phone, '')) > 0
  );

DROP POLICY IF EXISTS "Anyone can submit estimate requests" ON public.estimate_requests;
CREATE POLICY "Anyone can submit estimate requests"
  ON public.estimate_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(contact_name) > 0
    AND length(contact_phone) > 0
    AND length(property_type) > 0
    AND status = 'new'
  );

COMMIT;