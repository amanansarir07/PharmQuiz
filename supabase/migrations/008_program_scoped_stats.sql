-- ============================================================
-- 008: programme-scoped stats
-- Run this whole file once in the Supabase SQL Editor.
--
-- Until now every student in every programme competed on ONE leaderboard and
-- shared ONE mock-exam schedule. This migration records which programme a
-- result belongs to and threads a `p_program` filter through the leaderboard
-- functions.
--
-- Ordering matters: the leaderboard_* views select from get_leaderboard, and
-- adding a parameter creates an OVERLOAD rather than replacing the function
-- (a 3-arg and a 4-arg version would both answer a 3-arg call, which Postgres
-- rejects as ambiguous). So: drop views -> drop functions -> recreate
-- functions -> recreate views.
--
-- `p_program` is nullable on purpose. NULL means "every programme", which is
-- what the leaderboard_* views use for their global board. The app always
-- passes a real slug.
--
-- Existing rows are backfilled to 'd-pharm-y2' (the only programme with
-- published content), so no student's history, rank, or schedule changes the
-- moment this runs.
-- ============================================================

-- ---------- 1) quiz_results: which programme a result belongs to ----------
alter table public.quiz_results
  add column if not exists program text not null default 'd-pharm-y2';

comment on column public.quiz_results.program is
  'Slug of the programme this result was earned in. Matches data/programs.ts. Also derivable from subject, but stored so the leaderboard can filter on an index.';

create index if not exists idx_quiz_results_program
  on public.quiz_results(program);
-- Every leaderboard/dashboard query filters by programme AND orders by time.
create index if not exists idx_quiz_results_program_completed
  on public.quiz_results(program, completed_at desc);
create index if not exists idx_quiz_results_program_user
  on public.quiz_results(program, user_id);

-- ---------- 2) mock_exams: which programme an exam is for ----------
alter table public.mock_exams
  add column if not exists program_slug text not null default 'd-pharm-y2';

comment on column public.mock_exams.program_slug is
  'Slug of the programme this exam is scheduled for. Only students browsing that programme see it.';

create index if not exists idx_mock_exams_program_starts
  on public.mock_exams(program_slug, starts_at);

-- ---------- 3) save_quiz_result: record the programme ----------
-- The 7-argument version must be DROPPED, not replaced: keeping it alongside
-- an 8-argument version with a default would make every 7-argument call
-- ambiguous. Dropping it is safe because the new one keeps p_program
-- defaulted, so older clients that omit it still resolve.
drop function if exists public.save_quiz_result(uuid, text, int, int, int, int, int);

create or replace function public.save_quiz_result(
  p_user_id uuid,
  p_subject text,
  p_score int,
  p_total int,
  p_correct int,
  p_accuracy int,
  p_time_taken int default null,
  p_program text default 'd-pharm-y2'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if p_user_id <> auth.uid() then
    raise exception 'You can only save your own quiz results';
  end if;

  insert into public.quiz_results
    (user_id, subject, score, total, correct, accuracy, time_taken, completed_at, program)
  values
    (p_user_id, p_subject, p_score, p_total, p_correct, p_accuracy, p_time_taken, now(),
     coalesce(nullif(p_program, ''), 'd-pharm-y2'))
  returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function public.save_quiz_result(uuid, text, int, int, int, int, int, text) from anon;
grant execute on function public.save_quiz_result(uuid, text, int, int, int, int, int, text) to authenticated;

-- ---------- 4) Period helpers (unchanged; re-declared so this file
--                  stands alone if 006 was skipped) ----------
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

grant execute on function get_period_start(text) to authenticated;

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

grant execute on function get_min_quizzes(text) to authenticated;

-- ---------- 5) Drop the views + functions before changing signatures ----------
drop view if exists public.leaderboard_daily;
drop view if exists public.leaderboard_weekly;
drop view if exists public.leaderboard_monthly;
drop view if exists public.leaderboard_all_time;

drop function if exists public.get_user_leaderboard_position(uuid, text);
drop function if exists public.get_leaderboard(text, int, int);

-- ---------- 6) get_leaderboard, now programme-aware ----------
create or replace function get_leaderboard(
  p_period text default 'all_time',
  p_program text default null,
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
      -- NULL = every programme (the global board the leaderboard_* views use)
      and (p_program is null or qr.program = p_program)
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

revoke execute on function get_leaderboard(text, text, int, int) from anon;
grant execute on function get_leaderboard(text, text, int, int) to authenticated;

-- ---------- 7) get_user_leaderboard_position, now programme-aware ----------
create or replace function get_user_leaderboard_position(
  p_user_id uuid,
  p_period text default 'all_time',
  p_program text default null
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
      and (p_program is null or qr.program = p_program)
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

revoke execute on function get_user_leaderboard_position(uuid, text, text) from anon;
grant execute on function get_user_leaderboard_position(uuid, text, text) to authenticated;

-- ---------- 8) Views: the cross-programme board ----------
-- No p_program argument, so these answer "how does everyone compare across
-- every programme". The in-app leaderboard calls the function directly with a
-- programme slug instead.
create or replace view public.leaderboard_daily as
select * from get_leaderboard('daily', null);

create or replace view public.leaderboard_weekly as
select * from get_leaderboard('weekly', null);

create or replace view public.leaderboard_monthly as
select * from get_leaderboard('monthly', null);

create or replace view public.leaderboard_all_time as
select * from get_leaderboard('all_time', null);

revoke select on public.leaderboard_daily from anon;
revoke select on public.leaderboard_weekly from anon;
revoke select on public.leaderboard_monthly from anon;
revoke select on public.leaderboard_all_time from anon;

grant select on public.leaderboard_daily to authenticated;
grant select on public.leaderboard_weekly to authenticated;
grant select on public.leaderboard_monthly to authenticated;
grant select on public.leaderboard_all_time to authenticated;

-- ---------- 9) Backfill ----------
update public.quiz_results
   set program = 'd-pharm-y2'
 where program is null or program = '';

update public.mock_exams
   set program_slug = 'd-pharm-y2'
 where program_slug is null or program_slug = '';
