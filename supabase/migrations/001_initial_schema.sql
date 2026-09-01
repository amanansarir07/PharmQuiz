-- PharmQuiz Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Subjects table
create table public.subjects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  icon text not null default '📚',
  total_units int not null default 0,
  exam_marks int not null default 0,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;

create policy "Anyone can view subjects"
  on public.subjects for select
  using (true);

create policy "Admins can manage subjects"
  on public.subjects for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Units table
create table public.units (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid not null references public.subjects on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  order_index int not null default 0,
  exam_hours int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.units enable row level security;

create policy "Anyone can view units"
  on public.units for select
  using (true);

create policy "Admins can manage units"
  on public.units for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Questions table
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  unit_id uuid not null references public.units on delete cascade,
  question_text text not null,
  options jsonb not null default '[]',
  correct_index int not null default 0 check (correct_index between 0 and 3),
  explanation text not null default '',
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  source text,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Anyone can view questions"
  on public.questions for select
  using (true);

create policy "Admins can manage questions"
  on public.questions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz sessions table
create table public.quiz_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles on delete cascade,
  subject_id uuid not null references public.subjects on delete cascade,
  config jsonb not null default '{}',
  score int,
  total int,
  time_taken_seconds int,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.quiz_sessions enable row level security;

create policy "Users can view own sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create own sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.quiz_sessions for update
  using (auth.uid() = user_id);

create policy "Admins can view all sessions"
  on public.quiz_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz answers table
create table public.quiz_answers (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references public.quiz_sessions on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  selected_index int check (selected_index between 0 and 3),
  is_correct boolean not null default false,
  time_spent_seconds int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.quiz_answers enable row level security;

create policy "Users can view own answers"
  on public.quiz_answers for select
  using (
    exists (
      select 1 from public.quiz_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

create policy "Users can manage own answers"
  on public.quiz_answers for all
  using (
    exists (
      select 1 from public.quiz_sessions
      where id = session_id and user_id = auth.uid()
    )
  );

-- Bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, question_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

-- Notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles on delete cascade,
  question_id uuid references public.questions on delete cascade,
  subject_id uuid references public.subjects on delete cascade,
  unit_id uuid references public.units on delete cascade,
  title text not null default '',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users can manage own notes"
  on public.notes for all
  using (auth.uid() = user_id);

-- User stats table (denormalized for fast queries)
create table public.user_stats (
  user_id uuid primary key references public.profiles on delete cascade,
  total_quizzes int not null default 0,
  total_correct int not null default 0,
  total_attempted int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_quiz_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

create policy "Users can view own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Anyone can view leaderboard stats"
  on public.user_stats for select
  using (true);

create policy "Users can update own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

create policy "System can insert stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

-- Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email
  );
  insert into public.user_stats (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Indexes for performance
create index idx_questions_unit_id on public.questions(unit_id);
create index idx_questions_difficulty on public.questions(difficulty);
create index idx_quiz_sessions_user_id on public.quiz_sessions(user_id);
create index idx_quiz_sessions_subject_id on public.quiz_sessions(subject_id);
create index idx_quiz_answers_session_id on public.quiz_answers(session_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_notes_user_id on public.notes(user_id);
