
-- 1. social_links table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.social_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT ALL ON public.social_links TO service_role;

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view enabled social links" ON public.social_links;
CREATE POLICY "Public view enabled social links" ON public.social_links
  FOR SELECT TO anon, authenticated USING (is_enabled = true);

DROP POLICY IF EXISTS "Admins view all social links" ON public.social_links;
CREATE POLICY "Admins view all social links" ON public.social_links
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage social links" ON public.social_links;
CREATE POLICY "Admins manage social links" ON public.social_links
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_social_links_updated ON public.social_links;
CREATE TRIGGER trg_social_links_updated
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed defaults so footer isn't empty
INSERT INTO public.social_links (platform, label, url, icon, sort_order, is_enabled) VALUES
  ('facebook',  'Facebook',  'https://facebook.com',  'facebook',  10, true),
  ('instagram', 'Instagram', 'https://instagram.com', 'instagram', 20, true),
  ('tiktok',    'TikTok',    'https://tiktok.com',    'tiktok',    30, false),
  ('whatsapp',  'WhatsApp',  'https://wa.me/27684963972', 'whatsapp', 40, true)
ON CONFLICT DO NOTHING;

-- 2. orders payment columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'cash_pending',
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- 3. Storage policies: admins can upload/update/delete in store-media
DROP POLICY IF EXISTS "Public read store-media" ON storage.objects;
CREATE POLICY "Public read store-media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'store-media');

DROP POLICY IF EXISTS "Admins upload store-media" ON storage.objects;
CREATE POLICY "Admins upload store-media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'store-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update store-media" ON storage.objects;
CREATE POLICY "Admins update store-media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'store-media' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete store-media" ON storage.objects;
CREATE POLICY "Admins delete store-media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'store-media' AND public.has_role(auth.uid(), 'admin'));
