-- Run in Supabase SQL Editor only after migration 018 is explicitly approved
-- and deployed. This query reads metadata and counts; it changes no data.
with room_tables as (
  select c.relname, c.relrowsecurity
  from pg_class c
  where c.oid in (to_regclass('public.community_rooms'),
                  to_regclass('public.community_room_memberships'))
), functions as (
  select 'public.community_select_room(text)' as signature
  union all select 'public.community_current_room()'
)
select (select count(*) from public.community_rooms) as rooms,
       (select count(*) from room_tables where relrowsecurity) as rls_room_tables,
       (select bool_and(
         not has_function_privilege('anon', to_regprocedure(signature), 'EXECUTE')
         and has_function_privilege('authenticated', to_regprocedure(signature), 'EXECUTE'))
         from functions) as room_rpc_permissions_ok,
       not has_table_privilege('anon', 'public.community_posts', 'SELECT')
         and not has_table_privilege('anon', 'public.community_replies', 'SELECT')
         and not has_table_privilege('anon', 'public.community_members', 'SELECT')
         as guest_chat_blocked,
       not has_table_privilege('authenticated', 'public.community_room_memberships', 'INSERT')
         and not has_table_privilege('authenticated', 'public.community_room_memberships', 'UPDATE')
         and not has_table_privilege('authenticated', 'public.community_room_memberships', 'DELETE')
         as membership_rpc_only,
       (select count(*) from public.published_questions) as published_questions,
       (select count(*) from public.question_correction_revisions) as mcq_revisions;
