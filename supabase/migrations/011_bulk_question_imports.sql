-- Bulk MCQ import and review pipeline.
-- Apply after 010. Static JSON banks remain supported; published rows below are
-- merged into the existing loader so no legacy practice data is replaced.

begin;

create table if not exists public.question_imports (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  program_slug text not null,
  subject_slug text not null,
  unit_id text not null,
  topic text,
  imported_count integer not null default 0 check (imported_count >= 0),
  published_count integer not null default 0 check (published_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.question_import_items (
  id uuid primary key default gen_random_uuid(),
  import_id uuid not null references public.question_imports(id) on delete cascade,
  position integer not null check (position >= 0),
  question_text text not null,
  options jsonb not null,
  correct_index integer,
  explanation text not null default '',
  difficulty text not null default 'medium',
  tags text[] not null default '{}',
  normalized_question text not null,
  validation jsonb not null default '{"critical": [], "warnings": []}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(import_id, position)
);

create table if not exists public.published_questions (
  id uuid primary key default gen_random_uuid(),
  program_slug text not null,
  subject_slug text not null,
  unit_id text not null,
  topic text,
  question_text text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index between 0 and 3),
  explanation text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  tags text[] not null default '{}',
  fingerprint text not null,
  import_id uuid references public.question_imports(id) on delete set null,
  import_item_id uuid unique references public.question_import_items(id) on delete set null,
  published_at timestamptz not null default now(),
  unique(program_slug, subject_slug, fingerprint)
);

create index if not exists idx_question_imports_created_by_created_at on public.question_imports(created_by, created_at desc);
create index if not exists idx_question_import_items_import on public.question_import_items(import_id, position);
create index if not exists idx_published_questions_subject on public.published_questions(program_slug, subject_slug);

alter table public.question_imports enable row level security;
alter table public.question_import_items enable row level security;
alter table public.published_questions enable row level security;

grant select, insert, update, delete on public.question_imports to authenticated;
grant select, insert, update, delete on public.question_import_items to authenticated;
grant select on public.published_questions to anon, authenticated;

create policy "Admins manage question imports" on public.question_imports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage question import items" on public.question_import_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Anyone can read published questions" on public.published_questions
  for select to anon, authenticated using (true);

create or replace function public.prevent_published_import_edits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_import_id uuid;
begin
  v_import_id := case when tg_op = 'DELETE' then old.import_id else new.import_id end;
  if exists (select 1 from public.question_imports where id = v_import_id and status = 'published') then
    raise exception 'Published import batches are read-only';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger question_import_items_read_only_after_publish
  before update or delete on public.question_import_items
  for each row execute function public.prevent_published_import_edits();

create or replace function public.publish_question_import(p_import_id uuid)
returns table(inserted_count integer, skipped_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer := 0;
  v_approved integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  if not exists (select 1 from public.question_imports where id = p_import_id) then
    raise exception 'Import batch not found';
  end if;

  if exists (select 1 from public.question_imports where id = p_import_id and status = 'published') then
    raise exception 'This import batch is already published';
  end if;

  select count(*) into v_approved
  from public.question_import_items i
  where i.import_id = p_import_id
    and i.status = 'approved'
    and coalesce(jsonb_array_length(i.validation->'critical'), 0) = 0
    and jsonb_typeof(i.options) = 'array'
    and jsonb_array_length(i.options) = 4
    and i.correct_index between 0 and 3
    and i.difficulty in ('easy', 'medium', 'hard');

  insert into public.published_questions (
    program_slug, subject_slug, unit_id, topic, question_text, options,
    correct_index, explanation, difficulty, tags, fingerprint, import_id, import_item_id
  )
  select b.program_slug, b.subject_slug, b.unit_id, b.topic, i.question_text, i.options,
    i.correct_index, i.explanation, i.difficulty, i.tags, md5(i.normalized_question), b.id, i.id
  from public.question_import_items i
  join public.question_imports b on b.id = i.import_id
  where i.import_id = p_import_id
    and i.status = 'approved'
    and coalesce(jsonb_array_length(i.validation->'critical'), 0) = 0
    and jsonb_typeof(i.options) = 'array'
    and jsonb_array_length(i.options) = 4
    and i.correct_index between 0 and 3
    and i.difficulty in ('easy', 'medium', 'hard')
  on conflict (program_slug, subject_slug, fingerprint) do nothing;

  get diagnostics v_inserted = row_count;

  update public.question_imports b
    set published_count = v_inserted,
        rejected_count = (select count(*) from public.question_import_items i where i.import_id = b.id and i.status = 'rejected'),
        status = 'published',
        published_at = now()
  where b.id = p_import_id;

  return query select v_inserted, greatest(v_approved - v_inserted, 0);
end;
$$;

revoke execute on function public.publish_question_import(uuid) from public, anon;
grant execute on function public.publish_question_import(uuid) to authenticated;

commit;
