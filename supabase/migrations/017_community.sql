-- Community v1. Apply only after reviewing and approving this migration.
-- No existing MCQ or student-history rows are changed.
begin;

do $$ begin
  if to_regclass('public.profiles') is null
    or to_regclass('public.published_questions') is null
    or to_regprocedure('public.is_admin()') is null then
    raise exception 'Community requires profiles, published questions, and is_admin()';
  end if;
  if has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') then
    raise exception 'Profile role is writable by authenticated; apply profile permission hardening first';
  end if;
end $$;

create table public.community_members (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  is_teacher boolean not null default false,
  joined_at timestamptz not null default now()
);
create table public.community_teacher_verifications (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz not null default now()
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 12 and 180),
  body text not null check (char_length(btrim(body)) between 20 and 10000),
  faculty_slug text check (faculty_slug in ('ctevt','plus-two','npc')),
  subject_slug text check (subject_slug is null or subject_slug ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
  question_id uuid references public.published_questions(id) on delete set null,
  status text not null default 'active' check (status in ('active','deleted','hidden')),
  is_locked boolean not null default false,
  accepted_reply_id uuid,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  reply_count integer not null default 0 check (reply_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  search_document tsvector generated always as
    (to_tsvector('english', title || ' ' || body)) stored
);
create table public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 10 and 5000),
  status text not null default 'active' check (status in ('active','deleted','hidden')),
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, post_id)
);
alter table public.community_posts add constraint community_accepted_reply_reference
  foreign key (accepted_reply_id) references public.community_replies(id) on delete set null;

create table public.community_votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  reply_id uuid references public.community_replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((post_id is null) <> (reply_id is null)),
  unique (voter_id, post_id),
  unique (voter_id, reply_id)
);
create table public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.community_posts(id) on delete cascade,
  reply_id uuid references public.community_replies(id) on delete cascade,
  reason text not null check (reason in ('incorrect','spam','harassment','other')),
  detail text not null default '' check (char_length(detail) <= 1000),
  state text not null default 'open' check (state in ('open','resolved','dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  check ((post_id is null) <> (reply_id is null)),
  unique (reporter_id, post_id),
  unique (reporter_id, reply_id)
);
create table public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.community_posts(id) on delete cascade,
  kind text not null check (kind in ('reply','accepted')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create table public.community_moderation_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.community_posts(id) on delete set null,
  reply_id uuid references public.community_replies(id) on delete set null,
  action text not null,
  created_at timestamptz not null default now()
);

create index community_posts_recent on public.community_posts(last_activity_at desc, id desc) where status = 'active';
create index community_posts_popular on public.community_posts(helpful_count desc, created_at desc) where status = 'active';
create index community_posts_unanswered on public.community_posts(created_at desc) where status = 'active' and accepted_reply_id is null;
create index community_posts_author on public.community_posts(author_id, created_at desc);
create index community_posts_tags on public.community_posts(faculty_slug, subject_slug, created_at desc);
create index community_posts_search on public.community_posts using gin(search_document);
create index community_replies_post on public.community_replies(post_id, created_at);
create index community_reports_open on public.community_reports(created_at desc) where state = 'open';
create index community_notifications_unread on public.community_notifications(recipient_id, created_at desc) where read_at is null;

create function public.community_sync_member()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.community_members set display_name = new.name,
    avatar_url = new.avatar_url, is_admin = (new.role = 'admin')
  where user_id = new.id;
  return new;
end $$;
create trigger community_profile_sync after update of name, avatar_url, role on public.profiles
  for each row execute function public.community_sync_member();

create function public.community_seed_member()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.community_members (user_id, display_name, avatar_url, is_admin, is_teacher)
  select p.id, p.name, p.avatar_url, p.role = 'admin',
    exists (select 1 from public.community_teacher_verifications t where t.user_id = p.id)
  from public.profiles p where p.id = new.author_id
  on conflict (user_id) do update set display_name = excluded.display_name,
    avatar_url = excluded.avatar_url, is_admin = excluded.is_admin,
    is_teacher = excluded.is_teacher;
  return new;
end $$;
create trigger community_post_seed_member after insert on public.community_posts
  for each row execute function public.community_seed_member();
create trigger community_reply_seed_member after insert on public.community_replies
  for each row execute function public.community_seed_member();

create function public.community_sync_teacher()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.community_members set is_teacher = true where user_id = new.user_id;
    return new;
  end if;
  update public.community_members set is_teacher = false where user_id = old.user_id;
  return old;
end $$;
create trigger community_teacher_sync after insert or delete on public.community_teacher_verifications
  for each row execute function public.community_sync_teacher();

create function public.community_post_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text || '/community-post', 0));
  if (select count(*) from public.community_posts p
      where p.author_id = new.author_id and p.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Posting limit reached. Please try again later.';
  end if;
  if exists (select 1 from public.community_posts p where p.author_id = new.author_id
      and p.created_at > now() - interval '1 day'
      and lower(btrim(p.title)) = lower(btrim(new.title))) then
    raise exception 'You already posted this question recently.';
  end if;
  return new;
end $$;
create trigger community_post_limit before insert on public.community_posts
  for each row execute function public.community_post_guard();

create function public.community_reply_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text || '/community-reply', 0));
  if (select count(*) from public.community_replies r
      where r.author_id = new.author_id and r.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Reply limit reached. Please try again later.';
  end if;
  if exists (select 1 from public.community_replies r where r.author_id = new.author_id
      and r.post_id = new.post_id and r.created_at > now() - interval '1 minute'
      and lower(btrim(r.body)) = lower(btrim(new.body))) then
    raise exception 'You already posted this reply.';
  end if;
  return new;
end $$;
create trigger community_reply_limit before insert on public.community_replies
  for each row execute function public.community_reply_guard();

create function public.community_reply_counts()
returns trigger language plpgsql security definer set search_path = '' as $$
declare delta integer;
begin
  delta := case when tg_op = 'INSERT' then 1
    when tg_op = 'DELETE' then -1
    when old.status = 'active' and new.status <> 'active' then -1
    when old.status <> 'active' and new.status = 'active' then 1 else 0 end;
  if delta <> 0 then
    update public.community_posts set reply_count = reply_count + delta,
      last_activity_at = now() where id = case when tg_op = 'DELETE' then old.post_id else new.post_id end;
  end if;
  if tg_op = 'INSERT' then
    insert into public.community_notifications(recipient_id, actor_id, post_id, kind)
    select p.author_id, new.author_id, p.id, 'reply'
    from public.community_posts p where p.id = new.post_id and p.author_id <> new.author_id;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger community_reply_tally after insert or delete or update of status on public.community_replies
  for each row execute function public.community_reply_counts();

create function public.community_vote_counts()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    if new.post_id is not null then
      update public.community_posts set helpful_count = helpful_count + 1 where id = new.post_id;
    else
      update public.community_replies set helpful_count = helpful_count + 1 where id = new.reply_id;
    end if;
    return new;
  end if;
  if old.post_id is not null then
    update public.community_posts set helpful_count = helpful_count - 1 where id = old.post_id;
  else
    update public.community_replies set helpful_count = helpful_count - 1 where id = old.reply_id;
  end if;
  return old;
end $$;
create trigger community_vote_tally after insert or delete on public.community_votes
  for each row execute function public.community_vote_counts();

create function public.community_touch_edited()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger community_post_edited before update of title, body, faculty_slug, subject_slug on public.community_posts
  for each row execute function public.community_touch_edited();
create trigger community_reply_edited before update of body on public.community_replies
  for each row execute function public.community_touch_edited();

alter table public.community_members enable row level security;
alter table public.community_teacher_verifications enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_votes enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_notifications enable row level security;
alter table public.community_moderation_events enable row level security;

revoke all on public.community_members, public.community_teacher_verifications,
  public.community_posts, public.community_replies, public.community_votes,
  public.community_reports, public.community_notifications,
  public.community_moderation_events from public, anon, authenticated;
grant select on public.community_members, public.community_posts,
  public.community_replies to anon, authenticated;
grant select on public.community_votes to authenticated;
grant select, insert on public.community_teacher_verifications to authenticated;
grant delete on public.community_teacher_verifications to authenticated;
grant insert (author_id, title, body, faculty_slug, subject_slug, question_id)
  on public.community_posts to authenticated;
grant update (title, body, faculty_slug, subject_slug) on public.community_posts to authenticated;
grant insert (post_id, author_id, body) on public.community_replies to authenticated;
grant update (body) on public.community_replies to authenticated;
grant insert (voter_id, post_id, reply_id) on public.community_votes to authenticated;
grant delete on public.community_votes to authenticated;
grant select, insert (reporter_id, post_id, reply_id, reason, detail)
  on public.community_reports to authenticated;
grant select, update (read_at) on public.community_notifications to authenticated;
grant select on public.community_moderation_events to authenticated;

create policy community_members_read on public.community_members for select to anon, authenticated using (true);
create policy community_teachers_read on public.community_teacher_verifications for select to authenticated using (public.is_admin());
create policy community_teachers_insert on public.community_teacher_verifications for insert to authenticated
  with check (public.is_admin() and verified_by = (select auth.uid()));
create policy community_teachers_delete on public.community_teacher_verifications for delete to authenticated using (public.is_admin());
create policy community_posts_read on public.community_posts for select to anon, authenticated
  using (status = 'active' or author_id = (select auth.uid()) or public.is_admin());
create policy community_posts_insert on public.community_posts for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'active' and not is_locked
    and accepted_reply_id is null and helpful_count = 0 and reply_count = 0);
create policy community_posts_edit on public.community_posts for update to authenticated
  using (author_id = (select auth.uid()) and status = 'active' and not is_locked)
  with check (author_id = (select auth.uid()) and status = 'active' and not is_locked);
create policy community_replies_read on public.community_replies for select to anon, authenticated
  using ((status = 'active' and exists (select 1 from public.community_posts p where p.id = post_id and p.status = 'active'))
    or author_id = (select auth.uid()) or public.is_admin());
create policy community_replies_insert on public.community_replies for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'active' and helpful_count = 0
    and exists (select 1 from public.community_posts p where p.id = post_id and p.status = 'active' and not p.is_locked));
create policy community_replies_edit on public.community_replies for update to authenticated
  using (author_id = (select auth.uid()) and status = 'active'
    and exists (select 1 from public.community_posts p where p.id = post_id and p.status = 'active' and not p.is_locked))
  with check (author_id = (select auth.uid()) and status = 'active');
create policy community_votes_read on public.community_votes for select to authenticated using (voter_id = (select auth.uid()));
create policy community_votes_insert on public.community_votes for insert to authenticated
  with check (voter_id = (select auth.uid()) and (
    (post_id is not null and exists (select 1 from public.community_posts p where p.id = post_id and p.status = 'active' and p.author_id <> (select auth.uid())))
    or (reply_id is not null and exists (select 1 from public.community_replies r join public.community_posts p on p.id = r.post_id
      where r.id = reply_id and r.status = 'active' and p.status = 'active' and r.author_id <> (select auth.uid())))));
create policy community_votes_delete on public.community_votes for delete to authenticated using (voter_id = (select auth.uid()));
create policy community_reports_read on public.community_reports for select to authenticated
  using (reporter_id = (select auth.uid()) or public.is_admin());
create policy community_reports_insert on public.community_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and state = 'open' and reviewed_at is null and reviewed_by is null
    and ((post_id is not null and exists (select 1 from public.community_posts p where p.id = post_id and p.status = 'active' and p.author_id <> (select auth.uid())))
      or (reply_id is not null and exists (select 1 from public.community_replies r where r.id = reply_id and r.status = 'active' and r.author_id <> (select auth.uid())))));
create policy community_notifications_read on public.community_notifications for select to authenticated
  using (recipient_id = (select auth.uid()));
create policy community_notifications_update on public.community_notifications for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy community_moderation_read on public.community_moderation_events for select to authenticated using (public.is_admin());

create function public.community_remove(p_kind text, p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor uuid := auth.uid();
begin
  if v_actor is null then raise exception 'Sign in required'; end if;
  if p_kind = 'post' then
    update public.community_posts set status = 'deleted' where id = p_id
      and status = 'active' and author_id = v_actor and not is_locked;
  elsif p_kind = 'reply' then
    update public.community_replies set status = 'deleted' where id = p_id
      and status = 'active' and author_id = v_actor
      and not exists (select 1 from public.community_posts p
        where p.id = post_id and (p.is_locked or p.accepted_reply_id = public.community_replies.id));
  else raise exception 'Invalid content type'; end if;
  if not found then raise exception 'Content cannot be removed'; end if;
end $$;

create function public.community_accept_reply(p_post_id uuid, p_reply_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_post public.community_posts%rowtype; v_reply public.community_replies%rowtype;
begin
  select * into v_post from public.community_posts where id = p_post_id for update;
  if not found or v_post.status <> 'active' or v_post.is_locked
    or (v_post.author_id <> auth.uid() and not public.is_admin()) then
    raise exception 'Cannot accept a reply'; end if;
  if v_post.accepted_reply_id = p_reply_id then return; end if;
  select * into v_reply from public.community_replies where id = p_reply_id and post_id = p_post_id and status = 'active';
  if not found then raise exception 'Reply is unavailable'; end if;
  update public.community_posts set accepted_reply_id = p_reply_id where id = p_post_id;
  if v_reply.author_id <> auth.uid() then
    insert into public.community_notifications(recipient_id, actor_id, post_id, kind)
    values (v_reply.author_id, auth.uid(), p_post_id, 'accepted');
  end if;
end $$;

create function public.community_moderate(p_kind text, p_id uuid, p_action text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_changed boolean;
begin
  if not public.is_admin() then raise exception 'Administrator required'; end if;
  if p_kind = 'post' and p_action in ('hide','restore','lock','unlock') then
    if p_action in ('hide','restore') then
      update public.community_posts set status = case when p_action = 'hide' then 'hidden' else 'active' end
      where id = p_id and status <> 'deleted';
    else
      update public.community_posts set is_locked = (p_action = 'lock') where id = p_id and status <> 'deleted';
    end if;
    v_changed := found;
  elsif p_kind = 'reply' and p_action in ('hide','restore') then
    update public.community_replies set status = case when p_action = 'hide' then 'hidden' else 'active' end
    where id = p_id and status <> 'deleted';
    v_changed := found;
    if p_action = 'hide' then
      update public.community_posts set accepted_reply_id = null where accepted_reply_id = p_id;
    end if;
  else raise exception 'Invalid moderation action'; end if;
  if not v_changed then raise exception 'Content unavailable'; end if;
  insert into public.community_moderation_events(actor_id, post_id, reply_id, action)
  values (auth.uid(), case when p_kind = 'post' then p_id end,
    case when p_kind = 'reply' then p_id end, p_action);
end $$;

create function public.community_review_report(p_report_id uuid, p_action text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_report public.community_reports%rowtype;
begin
  if not public.is_admin() then raise exception 'Administrator required'; end if;
  if p_action not in ('hide','dismiss') then raise exception 'Invalid review action'; end if;
  select * into v_report from public.community_reports where id = p_report_id and state = 'open' for update;
  if not found then raise exception 'Report unavailable'; end if;
  if p_action = 'hide' then
    perform public.community_moderate(
      case when v_report.post_id is not null then 'post' else 'reply' end,
      coalesce(v_report.post_id, v_report.reply_id), 'hide');
  end if;
  update public.community_reports set state = case when p_action = 'hide' then 'resolved' else 'dismissed' end,
    reviewed_at = now(), reviewed_by = auth.uid() where id = p_report_id;
end $$;

revoke all on function public.community_remove(text,uuid) from public, anon;
revoke all on function public.community_accept_reply(uuid,uuid) from public, anon;
revoke all on function public.community_moderate(text,uuid,text) from public, anon;
revoke all on function public.community_review_report(uuid,text) from public, anon;
revoke all on function public.community_sync_member(), public.community_seed_member(),
  public.community_sync_teacher(), public.community_post_guard(), public.community_reply_guard(),
  public.community_reply_counts(), public.community_vote_counts(), public.community_touch_edited()
  from public, anon, authenticated;
grant execute on function public.community_remove(text,uuid) to authenticated;
grant execute on function public.community_accept_reply(uuid,uuid) to authenticated;
grant execute on function public.community_moderate(text,uuid,text) to authenticated;
grant execute on function public.community_review_report(uuid,text) to authenticated;
commit;
