
-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS customer_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- helper: random alphanumeric
CREATE OR REPLACE FUNCTION public.gen_code(prefix text, len int)
RETURNS text LANGUAGE sql VOLATILE AS $$
  SELECT prefix || upper(substr(md5(random()::text || clock_timestamp()::text), 1, len));
$$;

-- backfill
UPDATE public.profiles
SET customer_code = public.gen_code('NXA-', 6)
WHERE customer_code IS NULL;

UPDATE public.profiles
SET referral_code = public.gen_code('REF', 6)
WHERE referral_code IS NULL;

-- 2. customer_addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  recipient text NOT NULL,
  phone text NOT NULL,
  street text NOT NULL,
  city text NOT NULL,
  province text,
  postal_code text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO authenticated;
GRANT ALL ON public.customer_addresses TO service_role;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers manage own addresses" ON public.customer_addresses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all addresses" ON public.customer_addresses
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_addr_updated BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. reward_points ledger
CREATE TABLE IF NOT EXISTS public.reward_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points int NOT NULL,
  reason text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reward_points TO authenticated;
GRANT ALL ON public.reward_points TO service_role;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own points" ON public.reward_points
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all points" ON public.reward_points
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_rp_updated BEFORE UPDATE ON public.reward_points
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. referrals
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reward_points int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view related referrals" ON public.referrals
  FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Admins manage all referrals" ON public.referrals
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ref_updated BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Updated handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count int;
  ref_code text;
  ref_user_id uuid;
  new_cust_code text;
  new_ref_code text;
BEGIN
  new_cust_code := public.gen_code('NXA-', 6);
  new_ref_code := public.gen_code('REF', 6);
  ref_code := new.raw_user_meta_data->>'referral_code';
  IF ref_code IS NOT NULL AND ref_code <> '' THEN
    SELECT id INTO ref_user_id FROM public.profiles WHERE referral_code = ref_code LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, customer_code, referral_code, referred_by)
  VALUES (
    new.id, new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new_cust_code, new_ref_code, ref_user_id
  );

  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'customer');
  END IF;

  IF ref_user_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, code)
    VALUES (ref_user_id, new.id, ref_code)
    ON CONFLICT (referred_id) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;

-- ensure auth trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Award points on new order (pending)
CREATE OR REPLACE FUNCTION public.award_order_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pts int;
BEGIN
  IF NEW.customer_id IS NULL THEN RETURN NEW; END IF;
  pts := GREATEST(0, floor(NEW.total / 10)::int);
  IF pts > 0 THEN
    INSERT INTO public.reward_points (user_id, points, reason, order_id, status)
    VALUES (NEW.customer_id, pts, 'Order #' || substr(NEW.id::text, 1, 8), NEW.id, 'pending');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_award_order_points ON public.orders;
CREATE TRIGGER trg_award_order_points
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.award_order_points();

-- 7. On order delivered: approve points + referral bonus
CREATE OR REPLACE FUNCTION public.on_order_delivered()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_row record;
  prior_delivered int;
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS DISTINCT FROM 'delivered') THEN
    -- approve pending points tied to this order
    UPDATE public.reward_points SET status = 'approved'
      WHERE order_id = NEW.id AND status = 'pending';

    -- referral bonus: if customer was referred and this is their first delivered order
    IF NEW.customer_id IS NOT NULL THEN
      SELECT * INTO ref_row FROM public.referrals WHERE referred_id = NEW.customer_id LIMIT 1;
      IF FOUND AND ref_row.status = 'pending' THEN
        SELECT count(*) INTO prior_delivered FROM public.orders
          WHERE customer_id = NEW.customer_id AND status = 'delivered' AND id <> NEW.id;
        IF prior_delivered = 0 THEN
          UPDATE public.referrals SET status = 'approved' WHERE id = ref_row.id;
          INSERT INTO public.reward_points (user_id, points, reason, status)
          VALUES (ref_row.referrer_id, ref_row.reward_points, 'Referral bonus', 'approved');
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_on_order_delivered ON public.orders;
CREATE TRIGGER trg_on_order_delivered
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.on_order_delivered();