-- ============================================================
-- 005: Scheduled mock exams + safe admin checks
-- Run this whole file once in the Supabase SQL Editor.
--
-- It does three things:
--   1. Adds a non-recursive is_admin() helper (SECURITY DEFINER),
--      which also FIXES the "infinite recursion in policy for
--      relation profiles" error you see in the browser console.
--   2. Replaces the old recursive "Admins can view all profiles"
--      policy with one built on is_admin().
--   3. Creates the mock_exams table where scheduled mocks live.
--
-- AFTER running, make yourself an admin (replace the email):
--   update public.profiles set role = 'admin'
--   where email = 'YOUR-LOGIN-EMAIL@example.com';
-- Then sign out and sign back in once.
-- ============================================================

-- ---------- 1) Non-recursive admin check ----------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------- 2) Fix the infinite-recursion policy ----------
-- The old policy selected from profiles inside profiles RLS,
-- which made Postgres recurse on every profiles query (500s).
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- ---------- 3) Scheduled mock exams ----------
create table if not exists public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Mock Test',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes integer not null default 80
    check (duration_minutes between 5 and 180),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint mock_exams_ends_after_start check (ends_at > starts_at)
);

alter table public.mock_exams enable row level security;

grant select, insert, update, delete on public.mock_exams to authenticated;

create policy "Authenticated users can view mock exams"
  on public.mock_exams for select
  to authenticated
  using (true);

create policy "Admins can manage mock exams"
  on public.mock_exams for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
