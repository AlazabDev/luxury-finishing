
DROP POLICY IF EXISTS "Products are publicly viewable" ON public.products;
REVOKE SELECT ON public.products FROM anon, authenticated;

CREATE POLICY "Admins can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.products TO authenticated;

CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = true) AS
SELECT id, external_id, product_code, name, description, category, brand,
       unit_price, unit_template, is_active, created_at
FROM public.products;

GRANT SELECT ON public.products_public TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can read estimate request attachments" ON storage.objects;

CREATE POLICY "Admins can read estimate request attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'luxury-finishing'
    AND (storage.foldername(name))[1] = 'estimate-requests'
    AND public.has_role(auth.uid(), 'admin')
  );
