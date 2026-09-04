-- ===== Fix leaderboard RPCs (safe to re-run) =====
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
      )::int as rank,
      count(*) over ()::int as total_participants
    from public.profiles p
    left join user_stats us on p.id = us.user_id
    where coalesce(us.quizzes_taken, 0) > 0
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
      p.id as user_id,
      p.name,
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
    from public.profiles p
    left join user_stats us on p.id = us.user_id
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
