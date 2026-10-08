
CREATE SEQUENCE IF NOT EXISTS public.customer_code_seq START 1;

-- Update handle_new_user to use NTM-CUST-#####
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_count int;
  ref_code text;
  ref_user_id uuid;
  new_cust_code text;
  new_ref_code text;
  seq_val bigint;
BEGIN
  seq_val := nextval('public.customer_code_seq');
  new_cust_code := 'NTM-CUST-' || lpad(seq_val::text, 5, '0');
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
$function$;