-- ===== Fix leaderboard RPCs (safe to re-run) =====
-- All periods follow Asia/Kathmandu (Nepal, UTC+5:45) so the daily board
-- resets at Nepal midnight, not UTC midnight.
create or replace function get_period_start(period text)
returns timestamptz
language sql
stable
as $$
  select case period
    when 'daily' then date_trunc('day', now() at time zone 'Asia/Kathmandu') at time zone 'Asia/Kathmandu'
    when 'weekly' then date_trunc('week', now() at time zone 'Asia/Kathmandu') at time zone 'Asia/Kathmandu'
    when 'monthly' then date_trunc('month', now() at time zone 'Asia/Kathmandu') at time zone 'Asia/Kathmandu'
    when 'all_time' then '1970-01-01'::timestamptz
    else date_trunc('day', now() at time zone 'Asia/Kathmandu') at time zone 'Asia/Kathmandu'
  end;
$$;

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
  v_period_start := public.get_period_start(p_period);
  v_min_quizzes := public.get_min_quizzes(p_period);

  return query
  with user_stats as (
    select
      qr.user_id,
      count(*)::int as quizzes_taken,
      sum(qr.correct)::int as total_correct,
      sum(qr.total)::int as total_attempted,
      round(
        (sum(qr.correct)::numeric / nullif(sum(qr.total), 0)) * 100, 2
      ) as overall_accuracy
    from public.quiz_results qr
    where qr.completed_at >= v_period_start
    group by qr.user_id
  ),
  ranked as (
    select
      us.user_id,
      us.quizzes_taken,
      us.total_correct,
      us.overall_accuracy as accuracy,
      case when us.quizzes_taken >= v_min_quizzes then true else false end as qualified,
      greatest(v_min_quizzes - us.quizzes_taken, 0) as quizzes_needed,
      round(
        (us.total_correct::numeric * 0.7) +
        (us.overall_accuracy::numeric * 0.3) +
        (least(us.quizzes_taken::numeric / v_min_quizzes, 1) * 10)
      , 2) as score,
      row_number() over (order by
        case when us.quizzes_taken >= v_min_quizzes then 1 else 2 end,
        round(
          (us.total_correct::numeric * 0.7) +
          (us.overall_accuracy::numeric * 0.3) +
          (least(us.quizzes_taken::numeric / v_min_quizzes, 1) * 10)
        , 2) desc,
        us.overall_accuracy desc,
        us.quizzes_taken desc
      )::int as rank,
      count(*) over ()::int as total_participants
    from user_stats us
  )
  select
    ranked.rank,
    ranked.total_participants,
    ranked.qualified,
    ranked.quizzes_needed,
    ranked.quizzes_taken,
    ranked.total_correct,
    ranked.accuracy
  from ranked
  where ranked.user_id = p_user_id;
end;
$$;

grant execute on function get_user_leaderboard_position(uuid, text) to authenticated;

create or replace function get_leaderboard(
  p_period text default 'all_time',
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  rank int,
  user_id uuid,
  name text,
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
  v_period_start := public.get_period_start(p_period);
  v_min_quizzes := public.get_min_quizzes(p_period);

  return query
  with user_stats as (
    select
      qr.user_id,
      count(*)::int as quizzes_taken,
      sum(qr.correct)::int as total_correct,
      sum(qr.total)::int as total_attempted,
      round(avg(qr.accuracy)::numeric, 2) as avg_accuracy,
      round(
        (sum(qr.correct)::numeric / nullif(sum(qr.total), 0)) * 100, 2
      ) as overall_accuracy
    from public.quiz_results qr
    where qr.completed_at >= v_period_start
    group by qr.user_id
  ),
  ranked as (
    select
      us.user_id,
      coalesce(nullif(p.name, ''), nullif(au.raw_user_meta_data ->> 'name', ''), split_part(au.email, '@', 1), 'User') as name,
      us.quizzes_taken,
      us.total_correct,
      us.total_attempted,
      us.overall_accuracy as accuracy,
      us.avg_accuracy,
      -- Score: weight by accuracy and volume (fair ranking)
      round(
        (us.total_correct::numeric * 0.7) +
        (us.overall_accuracy::numeric * 0.3) +
        (least(us.quizzes_taken::numeric / v_min_quizzes, 1) * 10)
      , 2) as score,
      case when us.quizzes_taken >= v_min_quizzes then true else false end as qualified,
      greatest(v_min_quizzes - us.quizzes_taken, 0) as quizzes_needed
    from user_stats us
    left join public.profiles p on p.id = us.user_id
    left join auth.users au on au.id = us.user_id
  )
  select
    row_number() over (order by
      case when ranked.qualified then 1 else 2 end,
      ranked.score desc,
      ranked.accuracy desc,
      ranked.quizzes_taken desc
    )::int as rank,
    ranked.user_id,
    ranked.name,
    ranked.quizzes_taken,
    ranked.total_correct,
    ranked.total_attempted,
    ranked.accuracy,
    ranked.avg_accuracy,
    ranked.score,
    ranked.qualified,
    ranked.quizzes_needed
  from ranked
  where ranked.quizzes_taken > 0
  order by
    case when ranked.qualified then 1 else 2 end,
    ranked.score desc,
    ranked.accuracy desc,
    ranked.quizzes_taken desc
  limit p_limit offset p_offset;
end;
$$;

revoke execute on function get_leaderboard(text, int, int) from anon;
grant execute on function get_leaderboard(text, int, int) to authenticated;

-- ===== Backfill: create profiles for any auth user missing one =====
-- Some quiz results belong to users who have no public.profiles row, so they
-- were invisible to the leaderboard. This re-creates those rows from auth.
insert into public.profiles (id, name, email)
select
  au.id,
  coalesce(au.raw_user_meta_data ->> 'name', ''),
  au.email
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null
on conflict (id) do nothing;
