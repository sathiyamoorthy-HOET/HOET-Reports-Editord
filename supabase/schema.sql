-- ============================================================
-- HOET Work Report — Supabase schema
-- Run this in the Supabase SQL Editor (or via CLI) once, then
-- run `npm run seed` to create the user accounts + profiles.
-- ============================================================

-- ── profiles: one row per user, linked to auth.users ────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique not null,
  full_name  text not null,
  email      text,
  role       text not null default 'editor'
             check (role in ('editor','manager')),
  pod        text,   -- manager's team
  focus      text,   -- content specialization (Organic / Course / Ads / Podcast)
  wfh        boolean not null default false,
  title      text,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- if upgrading an existing project, add the newer columns:
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists focus text;
alter table public.profiles add column if not exists wfh boolean not null default false;

-- ── work_entries: single source of truth (one row per video) ─
create table if not exists public.work_entries (
  id              uuid primary key default gen_random_uuid(),
  editor_id       uuid not null references public.profiles(id) on delete cascade,
  editor_name     text,   -- denormalised for fast reads
  pod             text,
  work_date       date not null default current_date,
  video_code      text,
  title           text not null,
  category        text not null check (category in ('organic','ads','reash','course')),
  duration_seconds int not null default 0,
  review_link     text,
  final_link      text,
  status          text not null default 'editing'
                  check (status in ('editing','under_review','revisions','approved','published')),
  remarks         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists work_entries_editor_date_idx
  on public.work_entries (editor_id, work_date);
create index if not exists work_entries_date_idx
  on public.work_entries (work_date);

-- ── keep updated_at fresh + denormalise editor_name/pod ──────
create or replace function public.work_entries_stamp()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at := now();
  select p.full_name, p.pod into new.editor_name, new.pod
  from public.profiles p where p.id = new.editor_id;
  return new;
end;
$$;

drop trigger if exists work_entries_stamp_trg on public.work_entries;
create trigger work_entries_stamp_trg
  before insert or update on public.work_entries
  for each row execute function public.work_entries_stamp();

-- ── role helper (reads caller's own profile row) ─────────────
create or replace function public.current_user_role()
returns text language sql security definer stable set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.work_entries enable row level security;

-- profiles: everyone signed in can read the roster (needed for
-- dashboards); a user can update their own row; admins update any.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_manager_all on public.profiles;
create policy profiles_manager_all on public.profiles
  for all to authenticated
  using (public.current_user_role() = 'manager')
  with check (public.current_user_role() = 'manager');

-- work_entries: everyone signed in can read all (dashboards roll up
-- across the whole team). Editors write their own rows; managers,
-- deputies and admins may write any row (e.g. corrections).
drop policy if exists entries_select on public.work_entries;
create policy entries_select on public.work_entries
  for select to authenticated using (true);

drop policy if exists entries_insert on public.work_entries;
create policy entries_insert on public.work_entries
  for insert to authenticated
  with check (
    editor_id = (select auth.uid())
    or public.current_user_role() = 'manager'
  );

drop policy if exists entries_update on public.work_entries;
create policy entries_update on public.work_entries
  for update to authenticated
  using (
    editor_id = (select auth.uid())
    or public.current_user_role() = 'manager'
  )
  with check (
    editor_id = (select auth.uid())
    or public.current_user_role() = 'manager'
  );

drop policy if exists entries_delete on public.work_entries;
create policy entries_delete on public.work_entries
  for delete to authenticated
  using (
    editor_id = (select auth.uid())
    or public.current_user_role() = 'manager'
  );

-- ── expose to Data API + realtime ───────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.work_entries to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- enable realtime broadcasts for both tables
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'work_entries'
  ) then
    execute 'alter publication supabase_realtime add table public.work_entries';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles'
  ) then
    execute 'alter publication supabase_realtime add table public.profiles';
  end if;
end $$;
