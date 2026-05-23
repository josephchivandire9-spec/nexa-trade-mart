
-- 1. Roles
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'customer',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 3. Trigger: auto profile + first user becomes admin
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));

  select count(*) into user_count from auth.users;
  if user_count = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- 5. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create trigger categories_updated before update on public.categories for each row execute function public.set_updated_at();

create policy "Public view active categories" on public.categories for select using (is_active = true);
create policy "Admins view all categories" on public.categories for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 6. Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  discount_pct int default 0 check (discount_pct between 0 and 100),
  image_url text,
  gallery jsonb default '[]'::jsonb,
  category_id uuid references public.categories(id) on delete set null,
  stock int not null default 0,
  sku text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();
create index products_category_idx on public.products(category_id);
create index products_featured_idx on public.products(is_featured) where is_featured = true;

create policy "Public view active products" on public.products for select using (is_active = true);
create policy "Admins view all products" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 7. Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_address text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  notes text,
  source text default 'whatsapp',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();

create policy "Anyone can place an order" on public.orders for insert with check (true);
create policy "Admins view all orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 8. Contact messages
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;

create policy "Anyone can submit a message" on public.contact_messages for insert with check (true);
create policy "Admins view messages" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update messages" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete messages" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- 9. Banners
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.banners enable row level security;
create trigger banners_updated before update on public.banners for each row execute function public.set_updated_at();

create policy "Public view active banners" on public.banners for select using (is_active = true);
create policy "Admins view all banners" on public.banners for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage banners" on public.banners for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 10. Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_location text,
  quote text not null,
  rating int default 5 check (rating between 1 and 5),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.testimonials enable row level security;

create policy "Public view active testimonials" on public.testimonials for select using (is_active = true);
create policy "Admins manage testimonials" on public.testimonials for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- 11. Storage bucket for product/banner images
insert into storage.buckets (id, name, public) values ('store-media', 'store-media', true)
on conflict (id) do nothing;

create policy "Public read store-media" on storage.objects for select using (bucket_id = 'store-media');
create policy "Admins upload store-media" on storage.objects for insert to authenticated with check (bucket_id = 'store-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update store-media" on storage.objects for update to authenticated using (bucket_id = 'store-media' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete store-media" on storage.objects for delete to authenticated using (bucket_id = 'store-media' and public.has_role(auth.uid(), 'admin'));

-- 12. Seed default categories
insert into public.categories (name, slug, sort_order) values
  ('Shoes', 'shoes', 1),
  ('Clothing', 'clothing', 2),
  ('Cellphones & Accessories', 'cellphones', 3),
  ('Electronics', 'electronics', 4),
  ('Household', 'household', 5),
  ('Beauty', 'beauty', 6);
