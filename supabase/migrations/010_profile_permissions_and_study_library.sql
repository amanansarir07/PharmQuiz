-- Apply after 009. Keep role changes reserved for database administrators,
-- and align the study library tables with the bundled question banks.
begin;

-- RLS limits which profile row a student may update, not which columns.
-- Remove table-wide UPDATE before granting only the student-editable columns.
revoke update on table public.profiles from public, anon, authenticated;
grant update (name, avatar_url, program_slug) on table public.profiles to authenticated;

-- Account deletion must go through the verified server route, which deletes
-- auth.users and lets FK cascades remove the profile and related records.
revoke delete on table public.profiles from public, anon, authenticated;
drop policy if exists "Users can delete own profile" on public.profiles;

-- The app's question banks live in JSON, so a saved question need not have a
-- corresponding row in public.questions. Preserve old FK-backed bookmarks.
alter table public.bookmarks
  add column if not exists question_text text,
  add column if not exists subject text,
  add column if not exists unit text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'bookmarks'
       and column_name = 'question_id'
  ) then
    alter table public.bookmarks alter column question_id drop not null;

    update public.bookmarks b
       set question_text = coalesce(b.question_text, q.question_text),
           subject = coalesce(b.subject, s.slug),
           unit = coalesce(b.unit, u.slug)
      from public.questions q
      join public.units u on u.id = q.unit_id
      join public.subjects s on s.id = u.subject_id
     where b.question_id = q.id
       and (b.question_text is null or b.subject is null or b.unit is null);
  end if;
end;
$$;

create index if not exists idx_bookmarks_user_subject
  on public.bookmarks(user_id, subject);

-- Notes can optionally be tagged with a programme subject label. Existing
-- subject_id relationships remain intact for records made against DB content.
alter table public.notes add column if not exists subject text;

commit;
