-- Leaderboard support: quiz_results table + RPC functions
-- Run this in Supabase SQL Editor

-- 1. Quiz results table (denormalized for fast leaderboard queries)
create table if not exists public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles on delete cascade,
  subject text not null default 'unknown',
  score int not null default 0,
  total int not null default 0,
  correct int not null default 0,
  accuracy int not null default 0,
  time_taken int,
  completed_at timestamptz not null default now()
);

alter table public.quiz_results enable row level security;

-- Users can insert their own results
do $$ begin
  create policy "Users can insert own results"
    on public.quiz_results for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Users can view their own results
do $$ begin
  create policy "Users can view own results"
    on public.quiz_results for select
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

-- Anyone can view results (needed for leaderboard)
do $$ begin
  create policy "Anyone can view results for leaderboard"
    on public.quiz_results for select
    using (true);
exception when duplicate_object then null;
end $$;

create index if not exists idx_quiz_results_user_id on public.quiz_results(user_id);
create index if not exists idx_quiz_results_completed_at on public.quiz_results(completed_at);
create index if not exists idx_quiz_results_subject on public.quiz_results(subject);

-- 2. Leaderboard RPC function
create or replace function public.get_leaderboard(
  p_period text default 'all_time',
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  rank bigint,
  user_id uuid,
  name text,
  email text,
  quizzes_taken bigint,
  total_correct bigint,
  total_attempted bigint,
  accuracy numeric,
  avg_accuracy numeric,
  score numeric,
  qualified boolean,
  quizzes_needed bigint
)
language sql
stable
security definer
set search_path = ''
as $$
with period_start as (
  select case
    when p_period = 'daily' then (current_date at time zone 'utc')
    when p_period = 'weekly' then (date_trunc('week', current_date at time zone 'utc'))
    when p_period = 'monthly' then (date_trunc('month', current_date at time zone 'utc'))
    else '1970-01-01'::timestamptz
  end as started
),
min_quizzes as (
  select case
    when p_period = 'daily' then 1::bigint
    when p_period = 'weekly' then 5::bigint
    when p_period = 'monthly' then 10::bigint
    else 20::bigint
  end as min_q
),
user_stats as (
  select
    qr.user_id,
    count(*) as quizzes_taken,
    sum(qr.correct) as total_correct,
    sum(qr.total) as total_attempted,
    case when sum(qr.total) > 0
      then round(sum(qr.correct)::numeric / sum(qr.total)::numeric * 100, 1)
      else 0
    end as accuracy,
    case when sum(qr.total) > 0
      then round(sum(qr.correct)::numeric / sum(qr.total)::numeric * 100, 1)
      else 0
    end as avg_accuracy,
    -- Score: (correct * 0.7) + (accuracy% * 0.3) + volume_bonus (capped at 10)
    (sum(qr.correct) * 0.7)
    + (case when sum(qr.total) > 0
        then round(sum(qr.correct)::numeric / sum(qr.total)::numeric * 100, 1)
        else 0 end * 0.3)
    + least(count(*), 10) as score
  from public.quiz_results qr, period_start ps
  where qr.completed_at >= ps.started
  group by qr.user_id
),
ranked as (
  select
    us.*,
    p.name,
    p.email,
    mq.min_q,
    row_number() over (order by us.score desc, us.accuracy desc, us.quizzes_taken desc) as rank,
    us.quizzes_taken >= mq.min_q as qualified,
    greatest(mq.min_q - us.quizzes_taken, 0) as quizzes_needed
  from user_stats us
  cross join min_quizzes mq
  join public.profiles p on p.id = us.user_id
)
select
  r.rank,
  r.user_id,
  r.name,
  r.email,
  r.quizzes_taken,
  r.total_correct,
  r.total_attempted,
  r.accuracy,
  r.avg_accuracy,
  round(r.score, 1) as score,
  r.qualified,
  r.quizzes_needed
from ranked r
order by r.rank
limit p_limit offset p_offset;
$$;

-- 3. User leaderboard position RPC function
create or replace function public.get_user_leaderboard_position(
  p_user_id uuid,
  p_period text default 'all_time'
)
returns table (
  rank bigint,
  total_participants bigint,
  qualified boolean,
  quizzes_needed bigint,
  quizzes_taken bigint,
  total_correct bigint,
  accuracy numeric
)
language sql
stable
security definer
set search_path = ''
as $$
with period_start as (
  select case
    when p_period = 'daily' then (current_date at time zone 'utc')
    when p_period = 'weekly' then (date_trunc('week', current_date at time zone 'utc'))
    when p_period = 'monthly' then (date_trunc('month', current_date at time zone 'utc'))
    else '1970-01-01'::timestamptz
  end as started
),
min_quizzes as (
  select case
    when p_period = 'daily' then 1::bigint
    when p_period = 'weekly' then 5::bigint
    when p_period = 'monthly' then 10::bigint
    else 20::bigint
  end as min_q
),
user_stats as (
  select
    qr.user_id,
    count(*) as quizzes_taken,
    sum(qr.correct) as total_correct,
    sum(qr.total) as total_attempted,
    case when sum(qr.total) > 0
      then round(sum(qr.correct)::numeric / sum(qr.total)::numeric * 100, 1)
      else 0
    end as accuracy,
    (sum(qr.correct) * 0.7)
    + (case when sum(qr.total) > 0
        then round(sum(qr.correct)::numeric / sum(qr.total)::numeric * 100, 1)
        else 0 end * 0.3)
    + least(count(*), 10) as score
  from public.quiz_results qr, period_start ps
  where qr.completed_at >= ps.started
  group by qr.user_id
),
ranked as (
  select
    us.*,
    mq.min_q,
    row_number() over (order by us.score desc, us.accuracy desc, us.quizzes_taken desc) as rank,
    count(*) over () as total_participants,
    us.quizzes_taken >= mq.min_q as qualified,
    greatest(mq.min_q - us.quizzes_taken, 0) as quizzes_needed
  from user_stats us
  cross join min_quizzes mq
)
select
  r.rank,
  r.total_participants,
  r.qualified,
  r.quizzes_needed,
  r.quizzes_taken,
  r.total_correct,
  r.accuracy
from ranked r
where r.user_id = p_user_id;
$$;
