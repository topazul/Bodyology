-- =============================================
-- Bodyology — full database schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -----------------------------------------------
-- USERS
-- -----------------------------------------------
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null check (role in ('coach', 'client')) default 'client',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------
-- COACH PROFILES
-- -----------------------------------------------
create table public.coach_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  bio              text,
  specialties      text[] not null default '{}',
  years_experience int,
  rating_avg       numeric(3,2) not null default 0,
  rating_count     int not null default 0,
  created_at       timestamptz not null default now(),
  unique(user_id)
);

-- Auto-create coach profile when a coach signs up
create or replace function public.handle_new_coach()
returns trigger language plpgsql security definer as $$
begin
  if new.role = 'coach' then
    insert into public.coach_profiles (user_id) values (new.id);
  end if;
  return new;
end;
$$;

create trigger on_user_created_coach
  after insert on public.users
  for each row execute procedure public.handle_new_coach();

-- -----------------------------------------------
-- COACH <> CLIENT RELATIONSHIPS
-- -----------------------------------------------
create table public.coach_clients (
  id              uuid primary key default uuid_generate_v4(),
  coach_id        uuid not null references public.users(id) on delete cascade,
  client_id       uuid not null references public.users(id) on delete cascade,
  goal            text,
  focus_type      text,
  program_week    int not null default 1,
  intensity_min   int not null default 60,
  intensity_max   int not null default 80,
  coach_note      text,
  active          boolean not null default true,
  started_at      date not null default current_date,
  created_at      timestamptz not null default now(),
  unique(coach_id, client_id)
);

-- -----------------------------------------------
-- WORKOUT DAYS
-- -----------------------------------------------
create table public.workout_days (
  id               uuid primary key default uuid_generate_v4(),
  coach_client_id  uuid not null references public.coach_clients(id) on delete cascade,
  week_number      int not null,
  day_of_week      int not null check (day_of_week between 0 and 6), -- 0=Mon
  day_type         text not null check (day_type in ('str','hyp','cor','aer','mob','rec','rst')) default 'rst',
  is_rest          boolean not null default false,
  coach_note       text,
  created_at       timestamptz not null default now(),
  unique(coach_client_id, week_number, day_of_week)
);

-- -----------------------------------------------
-- EXERCISES
-- -----------------------------------------------
create table public.exercises (
  id               uuid primary key default uuid_generate_v4(),
  workout_day_id   uuid not null references public.workout_days(id) on delete cascade,
  name             text not null,
  sets             text not null default '3x10',
  intensity_pct    int not null default 70 check (intensity_pct between 0 and 100),
  coach_note       text,
  video_url        text,
  order_index      int not null default 0,
  created_at       timestamptz not null default now()
);

-- -----------------------------------------------
-- EXERCISE COMPLETIONS
-- -----------------------------------------------
create table public.exercise_completions (
  id            uuid primary key default uuid_generate_v4(),
  exercise_id   uuid not null references public.exercises(id) on delete cascade,
  client_id     uuid not null references public.users(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  unique(exercise_id, client_id)
);

-- -----------------------------------------------
-- PERSONAL RECORDS
-- -----------------------------------------------
create table public.personal_records (
  id             uuid primary key default uuid_generate_v4(),
  client_id      uuid not null references public.users(id) on delete cascade,
  exercise_name  text not null,
  weight         numeric(8,2) not null,
  unit           text not null check (unit in ('kg','lbs')) default 'kg',
  notes          text,
  logged_at      timestamptz not null default now()
);

-- -----------------------------------------------
-- MESSAGES
-- -----------------------------------------------
create table public.messages (
  id               uuid primary key default uuid_generate_v4(),
  coach_client_id  uuid not null references public.coach_clients(id) on delete cascade,
  sender_id        uuid not null references public.users(id) on delete cascade,
  body             text not null,
  sent_at          timestamptz not null default now(),
  read_at          timestamptz
);

-- -----------------------------------------------
-- COACH REVIEWS
-- -----------------------------------------------
create table public.coach_reviews (
  id               uuid primary key default uuid_generate_v4(),
  coach_id         uuid not null references public.users(id) on delete cascade,
  client_id        uuid not null references public.users(id) on delete cascade,
  rating           int not null check (rating between 1 and 5),
  duration_worked  text,
  goal             text,
  key_result       text,
  review_text      text,
  created_at       timestamptz not null default now(),
  unique(coach_id, client_id)
);

-- Auto-update coach rating average when a review is added/updated
create or replace function public.update_coach_rating()
returns trigger language plpgsql security definer as $$
begin
  update public.coach_profiles
  set
    rating_avg   = (select round(avg(rating)::numeric, 2) from public.coach_reviews where coach_id = new.coach_id),
    rating_count = (select count(*) from public.coach_reviews where coach_id = new.coach_id)
  where user_id = new.coach_id;
  return new;
end;
$$;

create trigger on_review_upsert
  after insert or update on public.coach_reviews
  for each row execute procedure public.update_coach_rating();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.users               enable row level security;
alter table public.coach_profiles      enable row level security;
alter table public.coach_clients       enable row level security;
alter table public.workout_days        enable row level security;
alter table public.exercises           enable row level security;
alter table public.exercise_completions enable row level security;
alter table public.personal_records    enable row level security;
alter table public.messages            enable row level security;
alter table public.coach_reviews       enable row level security;

-- Users: can read all (for name display), edit own
create policy "Users are readable by authenticated" on public.users for select using (auth.role() = 'authenticated');
create policy "Users can update own profile"        on public.users for update using (auth.uid() = id);

-- Coach profiles: public read, coach edits own
create policy "Coach profiles readable by all"   on public.coach_profiles for select using (auth.role() = 'authenticated');
create policy "Coach can update own profile"      on public.coach_profiles for update using (auth.uid() = user_id);

-- Coach clients: coach and the specific client can see their relationship
create policy "Coach sees own relationships"   on public.coach_clients for select using (auth.uid() = coach_id);
create policy "Client sees own relationship"   on public.coach_clients for select using (auth.uid() = client_id);
create policy "Coach manages relationships"    on public.coach_clients for all    using (auth.uid() = coach_id);

-- Workout days
create policy "Coach manages workout days"   on public.workout_days for all    using (
  exists (select 1 from public.coach_clients where id = workout_days.coach_client_id and coach_id = auth.uid())
);
create policy "Client reads own workout days" on public.workout_days for select using (
  exists (select 1 from public.coach_clients where id = workout_days.coach_client_id and client_id = auth.uid())
);

-- Exercises
create policy "Coach manages exercises"   on public.exercises for all    using (
  exists (select 1 from public.workout_days wd join public.coach_clients cc on wd.coach_client_id = cc.id where wd.id = exercises.workout_day_id and cc.coach_id = auth.uid())
);
create policy "Client reads own exercises" on public.exercises for select using (
  exists (select 1 from public.workout_days wd join public.coach_clients cc on wd.coach_client_id = cc.id where wd.id = exercises.workout_day_id and cc.client_id = auth.uid())
);

-- Completions: client manages own
create policy "Client manages completions" on public.exercise_completions for all using (auth.uid() = client_id);
create policy "Coach reads completions"    on public.exercise_completions for select using (
  exists (select 1 from public.exercises e join public.workout_days wd on e.workout_day_id = wd.id join public.coach_clients cc on wd.coach_client_id = cc.id where e.id = exercise_completions.exercise_id and cc.coach_id = auth.uid())
);

-- PRs: client manages own, coach can read their clients'
create policy "Client manages own PRs"  on public.personal_records for all    using (auth.uid() = client_id);
create policy "Coach reads client PRs"  on public.personal_records for select using (
  exists (select 1 from public.coach_clients where client_id = personal_records.client_id and coach_id = auth.uid())
);

-- Messages: coach and client in the relationship
create policy "Relationship members read messages"  on public.messages for select using (
  exists (select 1 from public.coach_clients where id = messages.coach_client_id and (coach_id = auth.uid() or client_id = auth.uid()))
);
create policy "Relationship members send messages"  on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from public.coach_clients where id = messages.coach_client_id and (coach_id = auth.uid() or client_id = auth.uid()))
);

-- Reviews: readable by all, written by clients, one per coach-client pair
create policy "Reviews readable by authenticated"  on public.coach_reviews for select using (auth.role() = 'authenticated');
create policy "Clients can write reviews"          on public.coach_reviews for insert with check (auth.uid() = client_id);
create policy "Clients can update own review"      on public.coach_reviews for update using (auth.uid() = client_id);

-- =============================================
-- Enable Realtime for messages
-- =============================================
alter publication supabase_realtime add table public.messages;
