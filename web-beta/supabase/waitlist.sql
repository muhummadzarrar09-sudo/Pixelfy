-- Pixelfy Beta waitlist — Supabase
-- Run in SQL editor — Project: pixelfy (sb_publishable_xxx)
create table if not exists public.beta_waitlist (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  android_version text,
  device_model text,
  photographer_type text check (photographer_type in ('hobbyist','creator','pro','ecommerce','student')),
  current_apps text[],
  pain_point text,
  country text,
  referral text,
  consent_marketing boolean not null default false,
  beta_tier text default 'pioneer',
  agree_nda boolean default false,
  source text default 'betapixelfy.vercel.app',
  user_agent text,
  created_at timestamptz default now(),
  invited_at timestamptz,
  pro_code text
);
alter table public.beta_waitlist enable row level security;
-- public insert only, no select — RLS
drop policy if exists "insert waitlist" on public.beta_waitlist;
create policy "insert waitlist" on public.beta_waitlist
  for insert to anon, authenticated
  with check (true);
-- explicit grant — Supabase June 2026
grant insert on public.beta_waitlist to anon, authenticated;
grant select on public.beta_waitlist to authenticated;
-- pro_code generator
create or replace function public.generate_pioneer_code(in_email text)
returns text language sql as $$
  select 'PXFY-BETA-PIONEER-2026-' || upper(substring(md5(in_email || gen_random_uuid()::text) from 1 for 6))
$$;
