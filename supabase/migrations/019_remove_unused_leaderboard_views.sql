-- The app reads leaderboards through public.get_leaderboard(...). These four
-- legacy cross-programme views are unused and are flagged by Supabase because
-- PostgreSQL views run with their owner's privileges by default.
-- Views store no rows. This migration does not modify quiz results, profiles,
-- or the leaderboard RPC. DROP VIEW uses RESTRICT (the default), so an
-- unexpected database dependency aborts the transaction instead of cascading.
begin;

do $$
begin
  if to_regclass('public.quiz_results') is null
    or to_regprocedure('public.get_leaderboard(text,text,integer,integer)') is null then
    raise exception 'Programme-aware leaderboard schema is missing; aborting view cleanup';
  end if;
end;
$$;

drop view if exists public.leaderboard_daily;
drop view if exists public.leaderboard_weekly;
drop view if exists public.leaderboard_monthly;
drop view if exists public.leaderboard_all_time;

commit;
