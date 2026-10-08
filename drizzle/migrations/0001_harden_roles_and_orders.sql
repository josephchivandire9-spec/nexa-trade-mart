
-- 1. Harden has_role: only return truthful data for the caller themselves
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when _user_id = auth.uid() then exists (
      select 1 from public.user_roles where user_id = _user_id and role = _role
    )
    else false
  end
$$;

-- 2. Fix mutable search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- 3. Revoke direct EXECUTE on definer functions from anon/authenticated.
--    RLS policies use these via SECURITY DEFINER ownership, no grants needed.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;

-- 4. Lock down orders: remove "anyone can insert" + add admin-managed inserts via service_role only
drop policy if exists "Anyone can place an order" on public.orders;
-- Server function uses service_role (supabaseAdmin), which bypasses RLS, so no INSERT policy needed for clients.
revoke insert on public.orders from anon, authenticated;

-- 5. Remove broad public listing on store-media bucket (public bucket URLs still work directly)
drop policy if exists "Public read store-media" on storage.objects;