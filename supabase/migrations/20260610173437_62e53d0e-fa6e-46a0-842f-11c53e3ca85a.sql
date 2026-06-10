BEGIN;

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Anyone can insert quote requests" ON public.quote_requests;
CREATE POLICY "Anyone can insert quote requests"
  ON public.quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Admins can view quote requests" ON public.quote_requests;
CREATE POLICY "Admins can view quote requests"
  ON public.quote_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view cost estimates" ON public.cost_estimates;
CREATE POLICY "Admins can view cost estimates"
  ON public.cost_estimates
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view estimate requests" ON public.estimate_requests;
CREATE POLICY "Admins can view estimate requests"
  ON public.estimate_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE SELECT (buy_price) ON public.products FROM anon, authenticated;

DROP POLICY IF EXISTS "Admins can update luxury-finishing objects" ON storage.objects;
CREATE POLICY "Admins can update luxury-finishing objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'luxury-finishing' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'luxury-finishing' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete luxury-finishing objects" ON storage.objects;
CREATE POLICY "Admins can delete luxury-finishing objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'luxury-finishing' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can upload chat files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read chat files" ON storage.objects;

REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;

COMMIT;