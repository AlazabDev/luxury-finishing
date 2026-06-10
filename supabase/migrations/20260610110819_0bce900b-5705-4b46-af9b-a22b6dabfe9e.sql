
CREATE TABLE public.estimate_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  property_type TEXT NOT NULL,
  area NUMERIC,
  floors INTEGER NOT NULL DEFAULT 1,
  quality_tier TEXT NOT NULL DEFAULT 'standard',
  selected_scopes TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_min NUMERIC,
  estimated_max NUMERIC,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.estimate_requests TO anon, authenticated;
GRANT ALL ON public.estimate_requests TO service_role;

ALTER TABLE public.estimate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit estimate requests"
  ON public.estimate_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage policies for luxury-finishing bucket under estimate-requests/ prefix
CREATE POLICY "Anyone can upload estimate request attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'luxury-finishing'
    AND (storage.foldername(name))[1] = 'estimate-requests'
  );

CREATE POLICY "Anyone can read estimate request attachments"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'luxury-finishing'
    AND (storage.foldername(name))[1] = 'estimate-requests'
  );
