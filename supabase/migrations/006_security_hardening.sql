-- ============================================================
-- 006: Security hardening
-- Run this whole file once in the Supabase SQL Editor.
--
-- Fixes (in order of severity):
--   1. save_quiz_result: SECURITY DEFINER + granted to anon + accepts an
--      arbitrary user_id -> anyone could forge quiz results for ANY user
--      and farm the leaderboard. Now requires p_user_id = auth.uid()
--      and anon access is revoked.
--   2. update_profile: same class of bug -> anyone (even unauthenticated)
--      could rename ANY user. Now requires p_user_id = auth.uid() and
--      anon access is revoked.
--   3. quiz_results INSERT policies were "with check (true)" for anon and
--      authenticated -> direct table inserts could also forge rows for any
--      user_id. Replaced with auth.uid() = user_id.
--   4. "Anyone can view leaderboard results" (using true) let anon dump
--      every user's raw quiz history. Dropped; own-rows + admin only.
--   5. get_leaderboard returned every user's email (PII) and was callable
--      by anon. Email removed from the result; anon execute revoked.
--   6. leaderboard views exposed emails via default grants. Email removed
--      from leaderboard_view; anon select revoked on all leaderboard views.
--   7. Profiles had NO delete policy -> "Delete account" silently did
--      nothing. Added own-row delete (cascades quiz results, bookmarks,
--      notes, stats). Note: the auth.users row itself can only be removed
--      by a server-side admin (service-role) call.
-- ============================================================

-- ---------- 1) save_quiz_result: bind to the caller ----------
create or replace function public.save_quiz_result(
  p_user_id uuid,
  p_subject text,
  p_score int,
  p_total int,
  p_correct int,
  p_accuracy int,
  p_time_taken int default null
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

  insert into public.quiz_results (user_id, subject, score, total, correct, accuracy, time_taken, completed_at)
  values (p_user_id, p_subject, p_score, p_total, p_correct, p_accuracy, p_time_taken, now())
  returning id into new_id;

  return new_id;
end;
$$;

revoke execute on function public.save_quiz_result(uuid, text, int, int, int, int, int) from anon;
grant execute on function public.save_quiz_result(uuid, text, int, int, int, int, int) to authenticated;
-- ---------- 2) update_profile: bind to the caller ----------
create or replace function public.update_profile(
  p_user_id uuid,
  p_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'You can only update your own profile';
  end if;

  update public.profiles set name = p_name where id = p_user_id;
  -- Also update auth metadata
  update auth.users set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('name', p_name) where id = p_user_id;
end;
$$;

revoke execute on function public.update_profile(uuid, text) from anon;
grant execute on function public.update_profile(uuid, text) to authenticated;

-- ---------- 3) quiz_results INSERT: only your own rows ----------
drop policy if exists "Users can insert own results" on public.quiz_results;
drop policy if exists "Authenticated users can insert results" on public.quiz_results;
drop policy if exists "Anon users can insert results" on public.quiz_results;

create policy "Users can insert own results"
  on public.quiz_results for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ---------- 4) quiz_results SELECT: no more anon dump ----------
drop policy if exists "Anyone can view leaderboard results" on public.quiz_results;

-- ---------- 4b) helper functions (self-contained: 003 may not have run) ----------
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
    where (p.role != 'admin' or p.role is null)
      and coalesce(us.quizzes_taken, 0) > 0
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

-- ---------- 5) get_leaderboard: remove email, anon access ----------
drop view if exists public.leaderboard_daily;
drop view if exists public.leaderboard_weekly;
drop view if exists public.leaderboard_monthly;
drop view if exists public.leaderboard_all_time;
-- Return type changed (email removed) -> must drop before recreate
-- (otherwise: 4P13 cannot change return type of existing function)
drop function if exists public.get_leaderboard(text, int, int);
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
    where p.role != 'admin' or p.role is null
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
-- ---------- 6) leaderboard views: email removed, anon revoked ----------
-- Column set changed (email/role removed) -> must drop before recreate
drop view if exists public.leaderboard_view;
create or replace view public.leaderboard_view as
select
  p.id,
  p.name,
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
where p.role != 'admin' or p.role is null
order by qr.total_correct desc nulls last;

create or replace view public.leaderboard_daily as
select * from get_leaderboard('daily');

create or replace view public.leaderboard_weekly as
select * from get_leaderboard('weekly');

create or replace view public.leaderboard_monthly as
select * from get_leaderboard('monthly');

create or replace view public.leaderboard_all_time as
select * from get_leaderboard('all_time');

revoke select on public.leaderboard_view from anon, authenticated;
revoke select on public.leaderboard_daily from anon;
revoke select on public.leaderboard_weekly from anon;
revoke select on public.leaderboard_monthly from anon;
revoke select on public.leaderboard_all_time from anon;

grant select on public.leaderboard_daily to authenticated;
grant select on public.leaderboard_weekly to authenticated;
grant select on public.leaderboard_monthly to authenticated;
grant select on public.leaderboard_all_time to authenticated;

revoke execute on function get_user_leaderboard_position(uuid, text) from anon;
grant execute on function get_user_leaderboard_position(uuid, text) to authenticated;

-- ---------- 7) profiles: allow users to delete their own row ----------
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);
