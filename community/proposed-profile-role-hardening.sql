-- Production proposal only. Review and approve before running in SQL Editor.
-- Repairs the Community preflight failure without touching profile rows.
begin;

do $$ begin
  if to_regclass('public.profiles') is null
    or not exists (select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles'
        and column_name in ('name', 'avatar_url', 'role')
      group by table_schema, table_name having count(*) = 3) then
    raise exception 'Expected profile table or columns are missing';
  end if;
end $$;

-- RLS limits rows, while these grants limit editable columns. Preserve the
-- existing student profile editing path from migration 010.
revoke update on table public.profiles from public, anon, authenticated;
revoke update (role) on table public.profiles from public, anon, authenticated;
grant update (name, avatar_url) on table public.profiles to authenticated;
do $$ begin
  if exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'program_slug') then
    grant update (program_slug) on table public.profiles to authenticated;
  end if;
end $$;

do $$ begin
  if has_column_privilege('anon', 'public.profiles', 'role', 'UPDATE')
    or has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
    or not has_column_privilege('authenticated', 'public.profiles', 'name', 'UPDATE')
    or not has_column_privilege('authenticated', 'public.profiles', 'avatar_url', 'UPDATE') then
    raise exception 'Profile UPDATE privilege assertion failed; transaction rolled back';
  end if;
  if exists (select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'program_slug') then
    if not has_column_privilege('authenticated', 'public.profiles', 'program_slug', 'UPDATE') then
      raise exception 'Programme UPDATE privilege assertion failed; transaction rolled back';
    end if;
  end if;
end $$;

commit;
