-- A bulk file can contain the same question more than once. PostgreSQL cannot
-- update the same unique (programme, subject, fingerprint) record twice in a
-- single INSERT ... ON CONFLICT DO UPDATE statement. Keep the first approved
-- occurrence in source order and report the remaining duplicates as skipped.

begin;

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

  with eligible as (
    select distinct on (b.program_slug, b.subject_slug, md5(i.normalized_question))
      b.program_slug,
      b.subject_slug,
      coalesce(nullif(i.unit_id, ''), b.unit_id) as unit_id,
      coalesce(nullif(i.source_topic, ''), b.topic) as topic,
      i.question_text,
      i.options,
      i.correct_index,
      i.explanation,
      i.difficulty,
      i.tags,
      md5(i.normalized_question) as fingerprint,
      b.id as import_id,
      i.id as import_item_id,
      i.source_id,
      i.source_unit_number,
      i.source_unit_name,
      i.source_topic
    from public.question_import_items i
    join public.question_imports b on b.id = i.import_id
    where i.import_id = p_import_id
      and i.status = 'approved'
      and coalesce(jsonb_array_length(i.validation->'critical'), 0) = 0
      and jsonb_typeof(i.options) = 'array'
      and jsonb_array_length(i.options) = 4
      and i.correct_index between 0 and 3
      and i.difficulty in ('easy', 'medium', 'hard')
    order by b.program_slug, b.subject_slug, md5(i.normalized_question), i.position
  )
  insert into public.published_questions (
    program_slug, subject_slug, unit_id, topic, question_text, options,
    correct_index, explanation, difficulty, tags, fingerprint, import_id,
    import_item_id, source_id, source_unit_number, source_unit_name, source_topic
  )
  select
    program_slug, subject_slug, unit_id, topic, question_text, options,
    correct_index, explanation, difficulty, tags, fingerprint, import_id,
    import_item_id, source_id, source_unit_number, source_unit_name, source_topic
  from eligible
  on conflict (program_slug, subject_slug, fingerprint) do update
    set unit_id = excluded.unit_id,
        topic = excluded.topic,
        source_id = excluded.source_id,
        source_unit_number = excluded.source_unit_number,
        source_unit_name = excluded.source_unit_name,
        source_topic = excluded.source_topic,
        explanation = excluded.explanation,
        difficulty = excluded.difficulty,
        tags = excluded.tags;

  get diagnostics v_inserted = row_count;

  update public.question_imports b
    set published_count = v_inserted,
        rejected_count = (
          select count(*)
          from public.question_import_items i
          where i.import_id = b.id and i.status = 'rejected'
        ),
        status = 'published',
        published_at = now()
  where b.id = p_import_id;

  return query select v_inserted, greatest(v_approved - v_inserted, 0);
end;
$$;

revoke execute on function public.publish_question_import(uuid) from public, anon;
grant execute on function public.publish_question_import(uuid) to authenticated;

commit;
