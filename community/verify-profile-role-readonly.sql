-- Read-only diagnosis before the proposed patch and verification afterward.
-- Expected after patch: both can_update_role=false; authenticated can update
-- name/avatar and program when that column exists; anon cannot update them.
with roles(role_name) as (values ('anon'), ('authenticated')),
effective as (
  select role_name,
    has_table_privilege(role_name, 'public.profiles', 'UPDATE') as table_update,
    has_column_privilege(role_name, 'public.profiles', 'role', 'UPDATE') as can_update_role,
    has_column_privilege(role_name, 'public.profiles', 'name', 'UPDATE') as can_update_name,
    has_column_privilege(role_name, 'public.profiles', 'avatar_url', 'UPDATE') as can_update_avatar,
    case when exists (select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'profiles' and column_name = 'program_slug')
      then has_column_privilege(role_name, 'public.profiles', 'program_slug', 'UPDATE')
      else null end as can_update_program
  from roles
), grants as (
  select grantee, privilege_type, column_name
  from information_schema.column_privileges
  where table_schema = 'public' and table_name = 'profiles' and privilege_type = 'UPDATE'
), table_grants as (
  select case when acl.grantee = 0 then 'PUBLIC' else pg_get_userbyid(acl.grantee) end as grantee,
    acl.privilege_type, pg_get_userbyid(acl.grantor) as grantor
  from pg_class c
  cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) acl
  where c.oid = 'public.profiles'::regclass and acl.privilege_type = 'UPDATE'
), policies as (
  select policyname, cmd, roles, qual, with_check from pg_policies
  where schemaname = 'public' and tablename = 'profiles' and cmd = 'UPDATE'
)
select (select jsonb_agg(to_jsonb(effective) order by role_name) from effective) as effective_update,
       (select coalesce(jsonb_agg(to_jsonb(grants) order by grantee, column_name), '[]'::jsonb) from grants)
         as direct_column_update_grants,
       (select coalesce(jsonb_agg(to_jsonb(table_grants) order by grantee), '[]'::jsonb) from table_grants)
         as direct_table_update_grants,
       (select coalesce(jsonb_agg(to_jsonb(policies) order by policyname), '[]'::jsonb) from policies)
         as profile_update_policies,
       (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass) as rls_enabled,
       (select exists (select 1 from information_schema.columns
         where table_schema = 'public' and table_name = 'profiles' and column_name = 'program_slug'))
         as program_column_present,
       (select bool_and(not can_update_role and not table_update) from effective)
         and (select can_update_name and can_update_avatar and coalesce(can_update_program, true)
              from effective where role_name = 'authenticated')
         and (select not can_update_name and not can_update_avatar and not coalesce(can_update_program, false)
              from effective where role_name = 'anon') as community_profile_preflight_ready;
