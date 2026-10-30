-- Programme-scoped Community chat. Run only after reviewing and approving it.
-- Existing discussions remain intact with a NULL room and are visible only to
-- their authors and administrators until deliberately assigned to a room.
begin;

do $$ begin
  if to_regclass('public.community_posts') is null
    or to_regclass('public.community_replies') is null
    or to_regprocedure('public.is_admin()') is null then
    raise exception 'Community migration 017 must be installed first';
  end if;
end $$;

create table public.community_rooms (
  slug text primary key,
  program_slug text not null,
  content_program_slug text not null,
  faculty_slug text not null,
  label text not null,
  is_open boolean not null default true
);

insert into public.community_rooms (slug, program_slug, content_program_slug, faculty_slug, label) values
  ('d-pharm-y1', 'd-pharm-y1', 'd-pharm-y1', 'ctevt', 'D.Pharm · Year 1'),
  ('d-pharm-y2', 'd-pharm-y2', 'd-pharm-y2', 'ctevt', 'D.Pharm · Year 2'),
  ('d-pharm-y3', 'd-pharm-y3', 'd-pharm-y3', 'ctevt', 'D.Pharm · Year 3'),
  ('pcl-nursing', 'pcl-nursing', 'pcl-nursing', 'ctevt', 'PCL Nursing · Year 1'),
  ('pcl-nursing-y2', 'pcl-nursing-y2', 'pcl-nursing-y2', 'ctevt', 'PCL Nursing · Year 2'),
  ('pcl-nursing-y3', 'pcl-nursing-y3', 'pcl-nursing-y3', 'ctevt', 'PCL Nursing · Year 3'),
  ('health-assistant', 'health-assistant', 'd-pharm-y1', 'ctevt', 'HA · Year 1'),
  ('health-assistant-y2', 'health-assistant-y2', 'health-assistant-y2', 'ctevt', 'HA · Year 2'),
  ('health-assistant-y3', 'health-assistant-y3', 'health-assistant-y3', 'ctevt', 'HA · Year 3'),
  ('d-physiotherapy', 'd-physiotherapy', 'd-pharm-y1', 'ctevt', 'D. Physiotherapy · Year 1'),
  ('d-physiotherapy-y2', 'd-physiotherapy-y2', 'd-physiotherapy-y2', 'ctevt', 'D. Physiotherapy · Year 2'),
  ('d-physiotherapy-y3', 'd-physiotherapy-y3', 'd-physiotherapy-y3', 'ctevt', 'D. Physiotherapy · Year 3'),
  ('cmlt', 'cmlt', 'd-pharm-y1', 'ctevt', 'CMLT · Year 1'),
  ('cmlt-y2', 'cmlt-y2', 'cmlt-y2', 'ctevt', 'CMLT · Year 2'),
  ('cmlt-y3', 'cmlt-y3', 'cmlt-y3', 'ctevt', 'CMLT · Year 3'),
  ('c-pharm', 'c-pharm', 'c-pharm', 'npc', 'Pharmacy Assistant Registration'),
  ('plus-two-science-bio-g11', 'plus-two-science-bio', 'plus-two-science-bio', 'plus-two', '+2 Science (Biology) · Grade 11'),
  ('plus-two-science-bio-g12', 'plus-two-science-bio', 'plus-two-science-bio', 'plus-two', '+2 Science (Biology) · Grade 12'),
  ('plus-two-computer-g11', 'plus-two-computer', 'plus-two-computer', 'plus-two', '+2 Computer Science · Grade 11'),
  ('plus-two-computer-g12', 'plus-two-computer', 'plus-two-computer', 'plus-two', '+2 Computer Science · Grade 12'),
  ('plus-two-management-g11', 'plus-two-management', 'plus-two-management', 'plus-two', '+2 Management · Grade 11'),
  ('plus-two-management-g12', 'plus-two-management', 'plus-two-management', 'plus-two', '+2 Management · Grade 12');

create table public.community_room_memberships (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  room_slug text not null references public.community_rooms(slug),
  selected_at timestamptz not null default now()
);

alter table public.community_posts add column room_slug text references public.community_rooms(slug);
create index community_posts_room_recent on public.community_posts(room_slug, created_at desc, id desc)
  where status = 'active';
create index community_posts_room_search on public.community_posts(room_slug)
  where status = 'active';

-- A chat message needs no separate discussion title and may be short.
alter table public.community_posts drop constraint community_posts_title_check;
alter table public.community_posts add constraint community_posts_title_check
  check (char_length(btrim(title)) between 1 and 180);
alter table public.community_posts drop constraint community_posts_body_check;
alter table public.community_posts add constraint community_posts_body_check
  check (char_length(btrim(body)) between 1 and 10000);
alter table public.community_replies drop constraint community_replies_body_check;
alter table public.community_replies add constraint community_replies_body_check
  check (char_length(btrim(body)) between 1 and 5000);

alter table public.community_rooms enable row level security;
alter table public.community_room_memberships enable row level security;
revoke all on public.community_rooms, public.community_room_memberships from public, anon, authenticated;
grant select on public.community_rooms, public.community_room_memberships to authenticated;
create policy community_rooms_read on public.community_rooms for select to authenticated using (true);
create policy community_room_memberships_read on public.community_room_memberships
  for select to authenticated using (user_id = (select auth.uid()));

create function public.community_current_room()
returns text language sql stable security definer set search_path = '' as $$
  select m.room_slug from public.community_room_memberships m where m.user_id = auth.uid()
$$;
create function public.community_select_room(p_room_slug text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'Sign in required'; end if;
  if not exists (select 1 from public.community_rooms where slug = p_room_slug and is_open) then
    raise exception 'Community room unavailable';
  end if;
  insert into public.community_room_memberships(user_id, room_slug)
  values (v_user, p_room_slug)
  on conflict (user_id) do update set room_slug = excluded.room_slug,
    selected_at = now();
  return p_room_slug;
end $$;
revoke all on function public.community_current_room(), public.community_select_room(text) from public, anon;
grant execute on function public.community_current_room(), public.community_select_room(text) to authenticated;

-- Browsing a programme is self-selected in Bujh. The database records the
-- current selection; RLS never trusts a client-only room filter.
revoke select on public.community_posts, public.community_replies, public.community_members from anon;
grant insert (room_slug) on public.community_posts to authenticated;
drop policy community_members_read on public.community_members;
create policy community_members_read on public.community_members for select to authenticated using (true);
drop policy community_posts_read on public.community_posts;
create policy community_posts_read on public.community_posts for select to authenticated
  using (public.is_admin() or
    (room_slug = (select public.community_current_room()) and
      (status = 'active' or author_id = (select auth.uid()))) or
    (room_slug is null and author_id = (select auth.uid())));
drop policy community_posts_insert on public.community_posts;
create policy community_posts_insert on public.community_posts for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'active' and not is_locked
    and accepted_reply_id is null and helpful_count = 0 and reply_count = 0
    and room_slug = (select public.community_current_room())
    and exists (select 1 from public.community_rooms room
      where room.slug = room_slug and room.is_open
        and (faculty_slug is null or faculty_slug = room.faculty_slug)
        and (question_id is null or exists
          (select 1 from public.published_questions q
           where q.id = question_id and q.program_slug = room.content_program_slug))));
drop policy community_posts_edit on public.community_posts;
create policy community_posts_edit on public.community_posts for update to authenticated
  using (author_id = (select auth.uid()) and status = 'active' and not is_locked
    and room_slug = (select public.community_current_room()))
  with check (author_id = (select auth.uid()) and status = 'active' and not is_locked
    and room_slug = (select public.community_current_room()));

drop policy community_replies_read on public.community_replies;
create policy community_replies_read on public.community_replies for select to authenticated
  using (public.is_admin() or exists (
    select 1 from public.community_posts p where p.id = post_id
      and ((p.room_slug = (select public.community_current_room()) and
        (p.status = 'active' or p.author_id = (select auth.uid())) and
        (public.community_replies.status = 'active'
          or public.community_replies.author_id = (select auth.uid())))
        or (p.room_slug is null and
          (p.author_id = (select auth.uid())
            or public.community_replies.author_id = (select auth.uid()))))));
drop policy community_replies_insert on public.community_replies;
create policy community_replies_insert on public.community_replies for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'active' and helpful_count = 0
    and exists (select 1 from public.community_posts p where p.id = post_id
      and p.status = 'active' and not p.is_locked
      and p.room_slug = (select public.community_current_room())));
drop policy community_replies_edit on public.community_replies;
create policy community_replies_edit on public.community_replies for update to authenticated
  using (author_id = (select auth.uid()) and status = 'active'
    and exists (select 1 from public.community_posts p where p.id = post_id
      and p.status = 'active' and not p.is_locked
      and p.room_slug = (select public.community_current_room())))
  with check (author_id = (select auth.uid()) and status = 'active');

drop policy community_votes_insert on public.community_votes;
create policy community_votes_insert on public.community_votes for insert to authenticated
  with check (voter_id = (select auth.uid()) and (
    (post_id is not null and exists (select 1 from public.community_posts p
      where p.id = post_id and p.status = 'active' and p.author_id <> (select auth.uid())
        and p.room_slug = (select public.community_current_room())))
    or (reply_id is not null and exists (select 1 from public.community_replies r
      join public.community_posts p on p.id = r.post_id
      where r.id = reply_id and r.status = 'active' and r.author_id <> (select auth.uid())
        and p.status = 'active' and p.room_slug = (select public.community_current_room())))));
drop policy community_reports_insert on public.community_reports;
create policy community_reports_insert on public.community_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and state = 'open'
    and reviewed_at is null and reviewed_by is null and (
      (post_id is not null and exists (select 1 from public.community_posts p
        where p.id = post_id and p.status = 'active' and p.author_id <> (select auth.uid())
          and p.room_slug = (select public.community_current_room())))
      or (reply_id is not null and exists (select 1 from public.community_replies r
        join public.community_posts p on p.id = r.post_id
        where r.id = reply_id and r.status = 'active' and r.author_id <> (select auth.uid())
          and p.status = 'active' and p.room_slug = (select public.community_current_room())))));

-- SECURITY DEFINER mutations also enforce room membership, including direct
-- RPC calls that bypass table RLS.
create or replace function public.community_remove(p_kind text, p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := auth.uid(); v_room text := public.community_current_room();
begin
  if v_actor is null or v_room is null then raise exception 'Select a Community room'; end if;
  if p_kind = 'post' then
    update public.community_posts set status = 'deleted' where id = p_id
      and status = 'active' and author_id = v_actor and not is_locked and room_slug = v_room;
  elsif p_kind = 'reply' then
    update public.community_replies set status = 'deleted' where id = p_id
      and status = 'active' and author_id = v_actor
      and exists (select 1 from public.community_posts p where p.id = post_id
        and p.room_slug = v_room and p.status = 'active' and not p.is_locked
        and p.accepted_reply_id is distinct from public.community_replies.id);
  else raise exception 'Invalid content type'; end if;
  if not found then raise exception 'Content cannot be removed'; end if;
end $$;

create or replace function public.community_accept_reply(p_post_id uuid, p_reply_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_post public.community_posts%rowtype; v_reply public.community_replies%rowtype;
begin
  select * into v_post from public.community_posts where id = p_post_id for update;
  if not found or v_post.status <> 'active' or v_post.is_locked
    or v_post.room_slug is distinct from public.community_current_room()
    or (v_post.author_id <> auth.uid() and not public.is_admin()) then
    raise exception 'Cannot accept a reply'; end if;
  if v_post.accepted_reply_id = p_reply_id then return; end if;
  select * into v_reply from public.community_replies
    where id = p_reply_id and post_id = p_post_id and status = 'active';
  if not found then raise exception 'Reply is unavailable'; end if;
  update public.community_posts set accepted_reply_id = p_reply_id where id = p_post_id;
  if v_reply.author_id <> auth.uid() then
    insert into public.community_notifications(recipient_id, actor_id, post_id, kind)
    values (v_reply.author_id, auth.uid(), p_post_id, 'accepted');
  end if;
end $$;

create or replace function public.community_post_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text || '/community-post', 0));
  if (select count(*) from public.community_posts p
      where p.author_id = new.author_id and p.created_at > now() - interval '5 minutes') >= 30 then
    raise exception 'Posting limit reached. Please try again later.';
  end if;
  if exists (select 1 from public.community_posts p where p.author_id = new.author_id
      and p.room_slug = new.room_slug and p.created_at > now() - interval '1 minute'
      and lower(btrim(p.body)) = lower(btrim(new.body))) then
    raise exception 'You already posted this message.';
  end if;
  return new;
end $$;

create or replace function public.community_reply_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text || '/community-reply', 0));
  if (select count(*) from public.community_replies r
      where r.author_id = new.author_id and r.created_at > now() - interval '5 minutes') >= 60 then
    raise exception 'Reply limit reached. Please try again later.';
  end if;
  if exists (select 1 from public.community_replies r where r.author_id = new.author_id
      and r.post_id = new.post_id and r.created_at > now() - interval '1 minute'
      and lower(btrim(r.body)) = lower(btrim(new.body))) then
    raise exception 'You already posted this reply.';
  end if;
  return new;
end $$;

commit;
