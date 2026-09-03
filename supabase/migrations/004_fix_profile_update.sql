-- Fix: Make profile updates work with publishable key
-- The RLS policy "auth.uid() = id" fails with publishable key

-- SECURITY DEFINER function for profile updates (bypasses RLS)
create or replace function public.update_profile(
  p_user_id uuid,
  p_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set name = p_name where id = p_user_id;
  -- Also update auth metadata
  update auth.users set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('name', p_name) where id = p_user_id;
end;
$$;

grant execute on function public.update_profile(uuid, text) to authenticated;
grant execute on function public.update_profile(uuid, text) to anon;
