
-- Harden products: revoke direct access to buy_price column for anon/authenticated
REVOKE SELECT (buy_price) ON public.products FROM anon, authenticated;

-- Tighten estimate-request anon uploads: extension allowlist + path shape + size hint
DROP POLICY IF EXISTS "Anyone can upload estimate request attachments" ON storage.objects;

CREATE POLICY "Anon can upload estimate request attachments (restricted)"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'luxury-finishing'
  AND (storage.foldername(name))[1] = 'estimate-requests'
  AND array_length(storage.foldername(name), 1) >= 2
  AND name ~* '\.(jpe?g|png|webp|gif|heic|pdf|docx?|xlsx?|txt|csv|zip|rar|dwg|dxf)$'
  AND name !~* '\.(svg|html?|js|mjs|cjs|exe|bat|cmd|sh|php|jsp)$'
  AND length(name) < 512
);
