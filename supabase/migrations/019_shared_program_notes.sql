-- Programme notes are separate from the student's private study notebook.
-- Apply after 005 (is_admin) and 010 (profile programme permissions).
begin;

create table public.shared_program_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  program_slug text not null check (length(program_slug) between 1 and 100),
  subject text not null default '',
  title text not null check (length(trim(title)) between 1 and 160),
  body text not null default '' check (length(body) <= 20000),
  file_path text unique,
  file_name text,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint shared_note_content_required check (length(trim(body)) > 0 or file_path is not null),
  constraint shared_note_file_pair check ((file_path is null) = (file_name is null)),
  constraint shared_note_owner_path check (file_path is null or file_path like author_id::text || '/%')
);

create index shared_program_notes_feed_idx on public.shared_program_notes (program_slug, created_at desc) where status = 'published';
create index shared_program_notes_queue_idx on public.shared_program_notes (created_at desc) where status = 'pending';
create index shared_program_notes_author_idx on public.shared_program_notes (author_id, created_at desc);
alter table public.shared_program_notes enable row level security;

create policy "Read published, own, and reviewable notes" on public.shared_program_notes
  for select to authenticated using (status = 'published' or author_id = (select auth.uid()) or public.is_admin());
create policy "Submit programme notes" on public.shared_program_notes
  for insert to authenticated with check (
    author_id = (select auth.uid()) and reviewed_by is null and reviewed_at is null
    and (status = 'pending' or (status = 'published' and public.is_admin()))
  );
create policy "Administrators review programme notes" on public.shared_program_notes
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Files stay private until their corresponding note is published. Authors and
-- administrators may inspect submissions while they are awaiting review.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('program-notes', 'program-notes', false, 10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Upload own programme note files" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'program-notes' and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Read accessible programme note files" on storage.objects
  for select to authenticated using (
    bucket_id = 'program-notes' and ((storage.foldername(name))[1] = (select auth.uid())::text or exists (
      select 1 from public.shared_program_notes n
      where n.file_path = name and (n.status = 'published' or n.author_id = (select auth.uid()) or public.is_admin())
    ))
  );
create policy "Remove unattached own programme note files" on storage.objects
  for delete to authenticated using (
    bucket_id = 'program-notes' and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (select 1 from public.shared_program_notes n where n.file_path = name)
  );

commit;
