-- ============================================================
-- 007: which programme a student is studying
-- Run this whole file once in the Supabase SQL Editor.
--
-- It does four things:
--   1. Adds `program_slug` to public.profiles (backfilled to the
--      only published programme, so existing students are unaffected).
--   2. Updates the signup trigger to copy the programme the student
--      picked on the registration form out of user metadata.
--   3. Adds a 3-argument update_profile overload so a student can
--      change programme without also having to change their name.
--      The old 2-argument version is left in place so any client
--      that hasn't been updated keeps working.
--   4. Backfills any rows that slipped through with a NULL programme.
--
-- There is deliberately NO foreign key to a programmes table: the
-- programme catalogue lives in the app (data/programs.ts), not in the
-- database. Adding or renaming a programme is a code change, and we
-- don't want a schema migration for it.
--
-- Everything here is additive and safe to run on live data.
-- ============================================================

-- ---------- 1) The column ----------
alter table public.profiles
  add column if not exists program_slug text not null default 'd-pharm-y2';

comment on column public.profiles.program_slug is
  'Slug of the programme the student studies. Matches data/programs.ts. No FK by design — the catalogue is code-owned.';

-- ---------- 2) Signup trigger ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, program_slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'program_slug', ''), 'd-pharm-y2')
  );
  insert into public.user_stats (user_id)
  values (new.id);
  return new;
end;
$$;

-- ---------- 3) 3-arg update_profile ----------
-- A NULL p_program_slug means "leave the programme alone", so callers that
-- only want to rename can't accidentally wipe the student's programme.
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

grant execute on function public.update_profile(uuid, text, text) to authenticated;
grant execute on function public.update_profile(uuid, text, text) to anon;

-- ---------- 4) Backfill ----------
update public.profiles
   set program_slug = 'd-pharm-y2'
 where program_slug is null or program_slug = '';
