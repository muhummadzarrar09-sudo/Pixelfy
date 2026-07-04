-- PixelForge Supabase schema — July 2026
-- RLS ON, explicit grants required (Supabase April 28 2026 breaking change)

create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text unique,
  avatar_url text,
  pro_tier boolean default false,
  created_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id),
  title text not null,
  source_uri text,
  thumb_uri text,
  width int,
  height int,
  status text default 'draft',
  is_favorite boolean default false,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table edits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  stack jsonb not null default '[]',
  version int default 1,
  created_at timestamptz default now()
);

create table presets (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id),
  name text not null,
  category text,
  stack jsonb not null,
  preview_uri text,
  downloads int default 0,
  is_pro boolean default false,
  created_at timestamptz default now()
);

create table batches (
  id uuid primary key default gen_random_uuid(),
  owner uuid references profiles(id),
  name text,
  preset_id uuid references presets(id),
  input_count int,
  status text,
  progress real default 0,
  created_at timestamptz default now()
);

create table exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  format text,
  quality int,
  width int,
  height int,
  file_uri text,
  file_size bigint,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table edits enable row level security;
alter table presets enable row level security;
alter table batches enable row level security;
alter table exports enable row level security;

-- Policies
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own projects" on projects for all using (owner = auth.uid());
create policy "own edits" on edits for all using (exists(select 1 from projects p where p.id = project_id and p.owner = auth.uid()));
create policy "read presets" on presets for select using (true);
create policy "manage own presets" on presets for all using (owner = auth.uid() or owner is null);
create policy "own batches" on batches for all using (owner = auth.uid());
create policy "own exports" on exports for all using (exists(select 1 from projects p where p.id = project_id and p.owner = auth.uid()));

-- Explicit grants (required post May 30 2026)
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on presets to anon;
grant usage on all sequences in schema public to authenticated;

-- Storage buckets
insert into storage.buckets (id, name, public) values ('originals','originals', false), ('exports','exports', false), ('presets_thumbs','presets_thumbs', true)
on conflict do nothing;
