-- ─────────────────────────────────────────────────────────────────────────────
-- FILE PATH: supabase/migrations/20260622000000_initial_schema.sql
-- Commit this file to GitHub. Vercel → Supabase CI will run it automatically.
-- ─────────────────────────────────────────────────────────────────────────────
-- ============================================================
-- SocialSell — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── ENUMS ────────────────────────────────────────────────
create type user_role as enum ('super_admin', 'vendor', 'customer');
create type product_type as enum ('course', 'ebook', 'template', 'music', 'software', 'other');
create type product_status as enum ('draft', 'pending_review', 'active', 'suspended');
create type order_status as enum ('pending', 'paid', 'fulfilled', 'refunded', 'disputed');
create type payout_status as enum ('pending', 'processing', 'completed', 'failed');
create type post_status as enum ('draft', 'scheduled', 'published', 'failed');
create type platform_name as enum ('instagram', 'tiktok', 'facebook', 'twitter', 'pinterest', 'youtube', 'linkedin');
create type affiliate_tier as enum ('bronze', 'silver', 'gold', 'platinum');
create type payment_provider as enum ('stripe', 'paystack');

-- ─── PROFILES ─────────────────────────────────────────────
-- Extends Supabase auth.users
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          user_role not null default 'customer',
  display_name  text,
  bio           text,
  avatar_url    text,          -- Cloudinary URL
  country       char(2),       -- ISO 3166-1 alpha-2
  currency      char(3) default 'USD',
  language      char(5) default 'en',
  stripe_customer_id   text,
  paystack_customer_id text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── VENDOR STORES ────────────────────────────────────────
create table stores (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  slug          text unique not null,     -- e.g. "designlab"
  name          text not null,
  description   text,
  logo_url      text,                     -- Cloudinary URL
  banner_url    text,                     -- Cloudinary URL
  website       text,
  platform_fee_override numeric(5,2),    -- null = use global default
  is_verified   boolean default false,
  is_suspended  boolean default false,
  stripe_account_id    text,             -- Stripe Connect account
  paystack_subaccount  text,             -- Paystack subaccount
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── PRODUCTS ─────────────────────────────────────────────
create table products (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references stores(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  type          product_type not null,
  status        product_status not null default 'draft',
  price_usd     numeric(10,2) not null,
  compare_price numeric(10,2),           -- crossed-out original price
  cover_url     text,                    -- Cloudinary URL
  preview_url   text,                    -- Cloudinary URL (watermarked preview)
  file_url      text,                    -- Cloudinary secure URL (hidden from buyers until purchase)
  file_size_mb  numeric(8,2),
  tags          text[],
  metadata      jsonb default '{}',      -- arbitrary extra data
  total_sales   integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique(store_id, slug)
);

-- ─── ORDERS ───────────────────────────────────────────────
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  buyer_id          uuid references profiles(id),
  buyer_email       text not null,        -- stored separately for guest checkout
  product_id        uuid not null references products(id),
  store_id          uuid not null references stores(id),
  status            order_status not null default 'pending',
  amount_usd        numeric(10,2) not null,
  currency_charged  char(3) not null,     -- what the buyer actually paid in
  amount_charged    numeric(10,2) not null,
  provider          payment_provider not null,
  provider_charge_id text,               -- Stripe charge ID or Paystack reference
  platform_fee      numeric(10,2),       -- SocialSell cut
  vendor_payout     numeric(10,2),       -- Vendor's share
  ip_address        inet,
  user_agent        text,
  refund_reason     text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ─── PAYOUTS ──────────────────────────────────────────────
create table payouts (
  id            uuid primary key default uuid_generate_v4(),
  store_id      uuid not null references stores(id),
  amount_usd    numeric(10,2) not null,
  currency      char(3) not null,
  provider      payment_provider not null,
  status        payout_status not null default 'pending',
  provider_payout_id text,
  notes         text,
  created_at    timestamptz default now(),
  processed_at  timestamptz
);

-- ─── SOCIAL ACCOUNTS (OAuth tokens) ───────────────────────
create table social_accounts (
  id              uuid primary key default uuid_generate_v4(),
  store_id        uuid not null references stores(id) on delete cascade,
  platform        platform_name not null,
  platform_user_id text not null,
  username        text,
  access_token    text not null,          -- encrypted at app level before storing
  refresh_token   text,
  token_expires_at timestamptz,
  scopes          text[],
  page_id         text,                   -- for Facebook pages
  metadata        jsonb default '{}',
  connected_at    timestamptz default now(),
  unique(store_id, platform)
);

-- ─── SCHEDULED POSTS ──────────────────────────────────────
create table scheduled_posts (
  id              uuid primary key default uuid_generate_v4(),
  store_id        uuid not null references stores(id) on delete cascade,
  product_id      uuid references products(id),
  platforms       platform_name[] not null,
  caption         text not null,
  media_urls      text[],                 -- Cloudinary URLs
  hashtags        text[],
  status          post_status not null default 'draft',
  scheduled_at    timestamptz,
  published_at    timestamptz,
  platform_post_ids jsonb default '{}',  -- { "instagram": "123", "tiktok": "456" }
  error_log       text,
  created_at      timestamptz default now()
);

-- ─── AFFILIATES ───────────────────────────────────────────
create table affiliates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id),
  store_id        uuid references stores(id),  -- null = platform-wide affiliate
  referral_code   text unique not null,
  tier            affiliate_tier not null default 'bronze',
  commission_rate numeric(5,2) not null default 10.00,
  total_clicks    integer default 0,
  total_sales     integer default 0,
  total_earned    numeric(10,2) default 0,
  is_active       boolean default true,
  created_at      timestamptz default now()
);

create table affiliate_clicks (
  id            uuid primary key default uuid_generate_v4(),
  affiliate_id  uuid not null references affiliates(id),
  product_id    uuid references products(id),
  ip_address    inet,
  user_agent    text,
  converted     boolean default false,
  order_id      uuid references orders(id),
  created_at    timestamptz default now()
);

-- ─── REVIEWS ──────────────────────────────────────────────
create table reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references products(id) on delete cascade,
  buyer_id    uuid not null references profiles(id),
  order_id    uuid not null references orders(id),
  rating      smallint not null check (rating between 1 and 5),
  title       text,
  body        text,
  is_verified boolean default true,
  created_at  timestamptz default now()
);

-- ─── PLATFORM SETTINGS (super admin) ──────────────────────
create table platform_settings (
  key   text primary key,
  value jsonb not null,
  updated_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- Seed default settings
insert into platform_settings (key, value) values
  ('platform_fee_pct',     '5'),
  ('payout_schedule',      '"weekly"'),
  ('min_payout_usd',       '20'),
  ('require_product_review', 'true'),
  ('affiliate_base_rate',  '10'),
  ('supported_currencies', '["USD","NGN","EUR","GBP","GHS","KES"]'),
  ('supported_languages',  '["en","fr","es","pt","yo","ig"]'),
  ('registration_open',    'true');

-- ─── ROW LEVEL SECURITY ───────────────────────────────────

alter table profiles         enable row level security;
alter table stores           enable row level security;
alter table products         enable row level security;
alter table orders           enable row level security;
alter table payouts          enable row level security;
alter table social_accounts  enable row level security;
alter table scheduled_posts  enable row level security;
alter table affiliates       enable row level security;
alter table reviews          enable row level security;

-- Helper: is current user a super_admin?
create or replace function is_super_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

-- profiles: users see their own; super_admin sees all
create policy "profiles: own read"   on profiles for select using (auth.uid() = id or is_super_admin());
create policy "profiles: own update" on profiles for update using (auth.uid() = id);

-- stores: public read; vendor manages own; super_admin all
create policy "stores: public read"  on stores for select using (true);
create policy "stores: vendor write" on stores for all using (auth.uid() = owner_id or is_super_admin());

-- products: public read of active; vendor manages own
create policy "products: public read"  on products for select using (status = 'active' or auth.uid() = (select owner_id from stores where id = store_id) or is_super_admin());
create policy "products: vendor write" on products for all using (auth.uid() = (select owner_id from stores where id = store_id) or is_super_admin());

-- orders: buyer sees own; vendor sees their store's; super_admin all
create policy "orders: buyer read"  on orders for select using (auth.uid() = buyer_id or auth.uid() = (select owner_id from stores where id = store_id) or is_super_admin());

-- social accounts: vendor manages own
create policy "social_accounts: vendor" on social_accounts for all using (auth.uid() = (select owner_id from stores where id = store_id) or is_super_admin());

-- scheduled posts: vendor manages own
create policy "scheduled_posts: vendor" on scheduled_posts for all using (auth.uid() = (select owner_id from stores where id = store_id) or is_super_admin());

-- affiliates: own + super_admin
create policy "affiliates: own" on affiliates for all using (auth.uid() = user_id or is_super_admin());

-- reviews: public read
create policy "reviews: public read"  on reviews for select using (true);
create policy "reviews: buyer write"  on reviews for insert with check (auth.uid() = buyer_id);

-- ─── FUNCTIONS & TRIGGERS ─────────────────────────────────

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated_at  before update on profiles        for each row execute function update_updated_at();
create trigger trg_stores_updated_at    before update on stores           for each row execute function update_updated_at();
create trigger trg_products_updated_at  before update on products         for each row execute function update_updated_at();
create trigger trg_orders_updated_at    before update on orders           for each row execute function update_updated_at();

-- Increment product total_sales on paid order
create or replace function increment_product_sales()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'paid' and (OLD.status is null or OLD.status <> 'paid') then
    update products set total_sales = total_sales + 1 where id = NEW.product_id;
  end if;
  return NEW;
end;
$$;
create trigger trg_increment_sales after insert or update on orders for each row execute function increment_product_sales();

-- Auto-tier affiliates based on total_sales
create or replace function update_affiliate_tier()
returns trigger language plpgsql as $$
begin
  NEW.tier := case
    when NEW.total_sales >= 151 then 'platinum'::affiliate_tier
    when NEW.total_sales >= 76  then 'gold'::affiliate_tier
    when NEW.total_sales >= 26  then 'silver'::affiliate_tier
    else 'bronze'::affiliate_tier
  end;
  return NEW;
end;
$$;
create trigger trg_affiliate_tier before update on affiliates for each row execute function update_affiliate_tier();

-- Create profile + store on signup (called from Edge Function)
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, role)
  values (NEW.id, NEW.raw_user_meta_data->>'display_name', 'customer');
  return NEW;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ─── INDEXES ──────────────────────────────────────────────
create index idx_products_store        on products(store_id);
create index idx_products_status       on products(status);
create index idx_products_type         on products(type);
create index idx_orders_buyer          on orders(buyer_id);
create index idx_orders_store          on orders(store_id);
create index idx_orders_status         on orders(status);
create index idx_orders_created        on orders(created_at desc);
create index idx_affiliate_clicks_aff  on affiliate_clicks(affiliate_id);
create index idx_scheduled_posts_store on scheduled_posts(store_id);
create index idx_scheduled_posts_sched on scheduled_posts(scheduled_at) where status = 'scheduled';
