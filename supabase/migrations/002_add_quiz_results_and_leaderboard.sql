-- Add quiz_results table (if missing) and leaderboard_view
-- Run this in Supabase SQL Editor

-- Quiz results table (for leaderboard and analytics)
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles on delete cascade,
  subject text not null,
  score int not null default 0,
  total int not null default 0,
  correct int not null default 0,
  accuracy int not null default 0,
  time_taken int,
  completed_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

-- Drop existing policies if they exist, then recreate
drop policy if exists "Users can view own results" on public.quiz_results;
drop policy if exists "Users can insert own results" on public.quiz_results;
drop policy if exists "Anyone can view leaderboard results" on public.quiz_results;
drop policy if exists "Admins can view all results" on public.quiz_results;

create policy "Users can view own results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

create policy "Anyone can view leaderboard results"
  on public.quiz_results for select
  using (true);

create policy "Admins can view all results"
  on public.quiz_results for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Index for performance
create index if not exists idx_quiz_results_user_id on public.quiz_results(user_id);
create index if not exists idx_quiz_results_subject on public.quiz_results(subject);
create index if not exists idx_quiz_results_completed_at on public.quiz_results(completed_at desc);

-- Leaderboard view (aggregates per user)
create or replace view public.leaderboard_view as
select
  p.id,
  p.name,
  p.email,
  p.role,
  p.created_at,
  coalesce(qr.total_correct, 0) as total_correct,
  coalesce(qr.total_quizzes, 0) as quizzes_taken,
  case
    when qr.total_attempted > 0 then round((qr.total_correct::numeric / qr.total_attempted) * 100)
    else 0
  end as accuracy
from public.profiles p
left join (
  select
    user_id,
    count(*) as total_quizzes,
    sum(correct) as total_correct,
    sum(total) as total_attempted
  from quiz_results
  group by user_id
) qr on p.id = qr.user_id
order by qr.total_correct desc nulls last;