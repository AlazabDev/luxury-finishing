
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id integer,
  product_code text,
  name text NOT NULL,
  description text,
  category text,
  brand text,
  unit_price numeric,
  buy_price numeric,
  unit_template text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_name ON public.products(name);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly viewable"
  ON public.products FOR SELECT
  USING (true);

CREATE TABLE public.cost_estimates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area numeric NOT NULL,
  property_type text NOT NULL,
  floors integer NOT NULL DEFAULT 1,
  quality_tier text NOT NULL DEFAULT 'standard',
  selected_scopes text[] NOT NULL DEFAULT '{}',
  estimated_min numeric NOT NULL,
  estimated_max numeric NOT NULL,
  contact_name text,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.cost_estimates TO anon, authenticated;
GRANT ALL ON public.cost_estimates TO service_role;

ALTER TABLE public.cost_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit cost estimates"
  ON public.cost_estimates FOR INSERT
  WITH CHECK (true);
