-- Apply after 008. SECURITY DEFINER functions must not inherit PostgreSQL's
-- default PUBLIC EXECUTE grant. Migration 007 also introduced a profile update
-- overload without an ownership check; restore that invariant here.

begin;

do $$
begin
  if to_regprocedure('public.save_quiz_result(uuid,text,integer,integer,integer,integer,integer,text)') is null
    or to_regprocedure('public.get_leaderboard(text,text,integer,integer)') is null
    or to_regprocedure('public.get_user_leaderboard_position(uuid,text,text)') is null then
    raise exception 'Migration 008 is missing or incomplete. Apply 008_program_scoped_stats.sql before 009.';
  end if;
end;
$$;

create or replace function public.update_profile(
  p_user_id uuid,
  p_name text,
  p_program_slug text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is distinct from auth.uid() then
    raise exception 'You can only update your own profile';
  end if;

  update public.profiles
     set name = p_name,
         program_slug = coalesce(p_program_slug, program_slug)
   where id = p_user_id;

  update auth.users
     set raw_user_meta_data =
           raw_user_meta_data
           || jsonb_build_object('name', p_name)
           || case
                when p_program_slug is null then '{}'::jsonb
                else jsonb_build_object('program_slug', p_program_slug)
              end
   where id = p_user_id;
end;
$$;

revoke execute on function public.update_profile(uuid, text, text) from public, anon;
grant execute on function public.update_profile(uuid, text, text) to authenticated;

revoke execute on function public.update_profile(uuid, text) from public, anon;
grant execute on function public.update_profile(uuid, text) to authenticated;

revoke execute on function public.save_quiz_result(uuid, text, int, int, int, int, int, text) from public, anon;
grant execute on function public.save_quiz_result(uuid, text, int, int, int, int, int, text) to authenticated;

revoke execute on function public.get_leaderboard(text, text, int, int) from public, anon;
grant execute on function public.get_leaderboard(text, text, int, int) to authenticated;

revoke execute on function public.get_user_leaderboard_position(uuid, text, text) from public, anon;
grant execute on function public.get_user_leaderboard_position(uuid, text, text) to authenticated;

revoke select on public.leaderboard_view from public, anon;
revoke select on public.leaderboard_daily, public.leaderboard_weekly,
  public.leaderboard_monthly, public.leaderboard_all_time from public, anon;
grant select on public.leaderboard_daily, public.leaderboard_weekly,
  public.leaderboard_monthly, public.leaderboard_all_time to authenticated;

commit;
