-- Fair Leaderboard System with 4 time periods
-- Run this in Supabase SQL Editor

-- Helper function to get period start
create or replace function get_period_start(period text)
returns timestamptz
language sql
stable
as $$
  select case period
    when 'daily' then date_trunc('day', now())
    when 'weekly' then date_trunc('week', now())::timestamptz
    when 'monthly' then date_trunc('month', now())::timestamptz
    when 'all_time' then '1970-01-01'::timestamptz
    else date_trunc('day', now())
  end;
$$;

-- Minimum quizzes required per period
create or replace function get_min_quizzes(period text)
returns int
language sql
stable
as $$
  select case period
    when 'daily' then 1
    when 'weekly' then 5
    when 'monthly' then 10
    when 'all_time' then 20
    else 1
  end;
$$;

-- Main leaderboard calculation function
create or replace function get_leaderboard(
  p_period text default 'all_time',
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  rank int,
  user_id uuid,
  name text,
  email text,
  quizzes_taken int,
  total_correct int,
  total_attempted int,
  accuracy numeric,
  avg_accuracy numeric,
  score numeric,
  qualified boolean,
  quizzes_needed int
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period_start timestamptz;
  v_min_quizzes int;
begin
  v_period_start := get_period_start(p_period);
  v_min_quizzes := get_min_quizzes(p_period);

  return query
  with user_stats as (
    select
      qr.user_id,
      count(*) as quizzes_taken,
      sum(qr.correct) as total_correct,
      sum(qr.total) as total_attempted,
      round(avg(qr.accuracy)::numeric, 2) as avg_accuracy,
      round(
        (sum(qr.correct)::numeric / nullif(sum(qr.total), 0)) * 100, 2
      ) as overall_accuracy
    from quiz_results qr
    where qr.completed_at >= v_period_start
    group by qr.user_id
  ),
  ranked as (
    select
      p.id as user_id,
      p.name,
      p.email,
      coalesce(us.quizzes_taken, 0) as quizzes_taken,
      coalesce(us.total_correct, 0) as total_correct,
      coalesce(us.total_attempted, 0) as total_attempted,
      coalesce(us.overall_accuracy, 0) as accuracy,
      coalesce(us.avg_accuracy, 0) as avg_accuracy,
      -- Score: weight by accuracy and volume (fair ranking)
      round(
        (coalesce(us.total_correct, 0)::numeric * 0.7) +
        (coalesce(us.overall_accuracy, 0)::numeric * 0.3) +
        (least(coalesce(us.quizzes_taken, 0)::numeric / v_min_quizzes, 1) * 10)
      , 2) as score,
      case when coalesce(us.quizzes_taken, 0) >= v_min_quizzes then true else false end as qualified,
      greatest(v_min_quizzes - coalesce(us.quizzes_taken, 0), 0) as quizzes_needed
    from profiles p
    left join user_stats us on p.id = us.user_id
    where p.role != 'admin' or p.role is null
  )
  select
    row_number() over (order by
      case when qualified then 1 else 2 end,
      score desc,
      accuracy desc,
      quizzes_taken desc
    ) as rank,
    user_id,
    name,
    email,
    quizzes_taken,
    total_correct,
    total_attempted,
    accuracy,
    avg_accuracy,
    score,
    qualified,
    quizzes_needed
  from ranked
  where quizzes_taken > 0
  order by
    case when qualified then 1 else 2 end,
    score desc,
    accuracy desc,
    quizzes_taken desc
  limit p_limit offset p_offset;
end;
$$;

-- Get current user's position in leaderboard
create or replace function get_user_leaderboard_position(
  p_user_id uuid,
  p_period text default 'all_time'
)
returns table (
  rank int,
  total_participants int,
  qualified boolean,
  quizzes_needed int,
  quizzes_taken int,
  total_correct int,
  accuracy numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_period_start timestamptz;
  v_min_quizzes int;
begin
  v_period_start := get_period_start(p_period);
  v_min_quizzes := get_min_quizzes(p_period);

  return query
  with user_stats as (
    select
      qr.user_id,
      count(*) as quizzes_taken,
      sum(qr.correct) as total_correct,
      sum(qr.total) as total_attempted,
      round(
        (sum(qr.correct)::numeric / nullif(sum(qr.total), 0)) * 100, 2
      ) as overall_accuracy
    from quiz_results qr
    where qr.completed_at >= v_period_start
    group by qr.user_id
  ),
  ranked as (
    select
      p.id as user_id,
      coalesce(us.quizzes_taken, 0) as quizzes_taken,
      coalesce(us.total_correct, 0) as total_correct,
      coalesce(us.overall_accuracy, 0) as accuracy,
      case when coalesce(us.quizzes_taken, 0) >= v_min_quizzes then true else false end as qualified,
      greatest(v_min_quizzes - coalesce(us.quizzes_taken, 0), 0) as quizzes_needed,
      round(
        (coalesce(us.total_correct, 0)::numeric * 0.7) +
        (coalesce(us.overall_accuracy, 0)::numeric * 0.3) +
        (least(coalesce(us.quizzes_taken, 0)::numeric / v_min_quizzes, 1) * 10)
      , 2) as score,
      row_number() over (order by
        case when coalesce(us.quizzes_taken, 0) >= v_min_quizzes then 1 else 2 end,
        round(
          (coalesce(us.total_correct, 0)::numeric * 0.7) +
          (coalesce(us.overall_accuracy, 0)::numeric * 0.3) +
          (least(coalesce(us.quizzes_taken, 0)::numeric / v_min_quizzes, 1) * 10)
        , 2) desc,
        coalesce(us.overall_accuracy, 0) desc,
        coalesce(us.quizzes_taken, 0) desc
      ) as rank,
      count(*) over () as total_participants
    from profiles p
    left join user_stats us on p.id = us.user_id
    where (p.role != 'admin' or p.role is null)
      and coalesce(us.quizzes_taken, 0) > 0
  )
  select
    rank,
    total_participants,
    qualified,
    quizzes_needed,
    quizzes_taken,
    total_correct,
    accuracy
  from ranked
  where user_id = p_user_id;
end;
$$;

-- View for easy querying (all-time)
create or replace view public.leaderboard_daily as
select * from get_leaderboard('daily');

create or replace view public.leaderboard_weekly as
select * from get_leaderboard('weekly');

create or replace view public.leaderboard_monthly as
select * from get_leaderboard('monthly');

create or replace view public.leaderboard_all_time as
select * from get_leaderboard('all_time');

-- Grant permissions
grant select on public.leaderboard_daily to anon, authenticated;
grant select on public.leaderboard_weekly to anon, authenticated;
grant select on public.leaderboard_monthly to anon, authenticated;
grant select on public.leaderboard_all_time to anon, authenticated;
grant execute on function get_leaderboard(text, int, int) to anon, authenticated;
grant execute on function get_user_leaderboard_position(uuid, text) to anon, authenticated;
grant execute on function get_period_start(text) to anon, authenticated;
grant execute on function get_min_quizzes(text) to anon, authenticated;