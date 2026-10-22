-- Correct the destination of one already-published question-import batch.
-- This is deliberately batch-scoped: it never moves all questions from a
-- subject, so valid content in the original subject is left untouched.

begin;

create or replace function public.retarget_published_question_import(
  p_import_id uuid,
  p_target_subject_slug text,
  p_target_unit_prefix text default null
)
returns table(moved_count integer, skipped_conflicts integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_subject_slug text;
  v_moved integer := 0;
  v_skipped integer := 0;
begin
  if not public.is_admin() then
    raise exception 'Admins only';
  end if;

  if nullif(trim(p_target_subject_slug), '') is null then
    raise exception 'A target subject is required';
  end if;

  select subject_slug
    into v_source_subject_slug
  from public.question_imports
  where id = p_import_id
    and status = 'published'
  for update;

  if v_source_subject_slug is null then
    raise exception 'Published import batch not found';
  end if;

  if v_source_subject_slug = p_target_subject_slug then
    raise exception 'This batch is already assigned to that subject';
  end if;

  -- A target subject can already contain the same question from another
  -- source. Retain that existing row and remove only the duplicate from the
  -- batch being moved, avoiding a unique-key collision during the update.
  delete from public.published_questions moving
  using public.published_questions existing
  where moving.import_id = p_import_id
    and moving.subject_slug = v_source_subject_slug
    and existing.program_slug = moving.program_slug
    and existing.subject_slug = p_target_subject_slug
    and existing.fingerprint = moving.fingerprint
    and existing.id <> moving.id;

  get diagnostics v_skipped = row_count;

  -- Published import items are normally immutable. Temporarily changing this
  -- batch's state inside the transaction lets its own unit metadata be fixed;
  -- any error rolls the whole transaction back and leaves it published.
  update public.question_imports
  set status = 'draft'
  where id = p_import_id;

  update public.question_import_items
  set unit_id = case
    when nullif(trim(coalesce(p_target_unit_prefix, '')), '') is not null
      and source_unit_number is not null
      then p_target_unit_prefix || source_unit_number::text
    else 'all'
  end
  where import_id = p_import_id;

  update public.published_questions
  set subject_slug = p_target_subject_slug,
      unit_id = case
        when nullif(trim(coalesce(p_target_unit_prefix, '')), '') is not null
          and source_unit_number is not null
          then p_target_unit_prefix || source_unit_number::text
        else 'all'
      end
  where import_id = p_import_id
    and subject_slug = v_source_subject_slug;

  get diagnostics v_moved = row_count;

  update public.question_imports
  set subject_slug = p_target_subject_slug,
      unit_id = 'all',
      topic = null,
      published_count = v_moved,
      status = 'published',
      published_at = now()
  where id = p_import_id;

  return query select v_moved, v_skipped;
end;
$$;

revoke execute on function public.retarget_published_question_import(uuid, text, text) from public, anon;
grant execute on function public.retarget_published_question_import(uuid, text, text) to authenticated;

commit;
