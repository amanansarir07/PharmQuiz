-- Run in the Supabase SQL Editor after migration 019. Read-only verification.
-- The four view checks should be true. Compare the row counts with a
-- pre-migration snapshot if you have one; migration 019 never touches tables.
select
  to_regclass('public.leaderboard_daily') is null as daily_view_removed,
  to_regclass('public.leaderboard_weekly') is null as weekly_view_removed,
  to_regclass('public.leaderboard_monthly') is null as monthly_view_removed,
  to_regclass('public.leaderboard_all_time') is null as all_time_view_removed,
  to_regprocedure('public.get_leaderboard(text,text,integer,integer)') is not null
    as leaderboard_rpc_preserved,
  (select count(*) from public.quiz_results) as quiz_result_rows,
  (select count(*) from public.profiles) as profile_rows;
