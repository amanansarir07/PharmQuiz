-- Run after an explicitly approved migration 017 deployment. Read-only.
with required_tables(name) as (
  values ('community_members'), ('community_teacher_verifications'),
    ('community_posts'), ('community_replies'), ('community_votes'),
    ('community_reports'), ('community_notifications'),
    ('community_moderation_events')
), table_state as (
  select name, c.oid, c.relrowsecurity
  from required_tables t left join pg_class c
    on c.oid = to_regclass('public.' || t.name)
), rpc(signature) as (
  values ('public.community_remove(text,uuid)'),
    ('public.community_accept_reply(uuid,uuid)'),
    ('public.community_moderate(text,uuid,text)'),
    ('public.community_review_report(uuid,text)')
), rpc_state as (
  select signature, to_regprocedure(signature) as oid from rpc
)
select (select count(*) from table_state where oid is not null) as installed_tables,
       (select count(*) from table_state where relrowsecurity) as rls_tables,
       (select count(*) from rpc_state where oid is not null) as installed_rpcs,
       (select bool_and(not has_function_privilege('anon', oid, 'EXECUTE')
         and has_function_privilege('authenticated', oid, 'EXECUTE'))
         from rpc_state where oid is not null) as rpc_permissions_ok,
       not has_table_privilege('anon', 'public.community_posts', 'INSERT')
         and not has_table_privilege('anon', 'public.community_replies', 'INSERT')
         and not has_table_privilege('authenticated', 'public.community_posts', 'DELETE')
         and not has_table_privilege('authenticated', 'public.community_replies', 'DELETE')
         and not has_table_privilege('authenticated', 'public.community_members', 'UPDATE')
         and not has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')
         as direct_write_guards_ok,
       (select count(*) from public.published_questions) as published_question_rows,
       (select count(*) from public.question_correction_revisions) as recovery_revision_rows;
