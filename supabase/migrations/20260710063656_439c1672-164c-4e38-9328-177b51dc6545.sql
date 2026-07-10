GRANT SELECT ON public.products_public TO anon, authenticated;
GRANT ALL ON public.products_public TO service_role;
REVOKE ALL ON public.products FROM anon;