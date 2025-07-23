-- GoalTracker Database Schema Migration
-- Run this in Supabase SQL Editor

-- USERS TABLE (extends auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  timezone text,
  language text,
  notification_settings jsonb,
  privacy_settings jsonb,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- GOALS TABLE
create type goal_category as enum ('Health', 'Career', 'Personal', 'Financial', 'Habits');
create type goal_type_enum as enum ('binary', 'numerical', 'percentage');
create type goal_status as enum ('active', 'completed', 'paused', 'archived');

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  category goal_category,
  goal_type goal_type_enum,
  target_value numeric,
  current_value numeric,
  unit text,
  deadline date,
  status goal_status default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- MILESTONES TABLE
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric,
  completed boolean default false,
  completed_at timestamp with time zone,
  order_index integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- PROGRESS ENTRIES TABLE
create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  value numeric not null,
  notes text,
  entry_date date not null,
  created_at timestamp with time zone default now()
);

-- TRIGGERS FOR updated_at FIELDS
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_users_timestamp
before update on public.users
for each row execute procedure update_timestamp();

create trigger update_goals_timestamp
before update on public.goals
for each row execute procedure update_timestamp();

create trigger update_milestones_timestamp
before update on public.milestones
for each row execute procedure update_timestamp();

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.progress_entries enable row level security;

-- Users can read/update their own profile
create policy "Users can manage own profile"
on public.users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- Goals
create policy "Users can manage their own goals"
on public.goals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Milestones
create policy "Users can manage milestones for their goals"
on public.milestones
for all
using (exists (
  select 1 from public.goals g
  where g.id = goal_id and g.user_id = auth.uid()
))
with check (true);

-- Progress Entries
create policy "Users can manage progress for their goals"
on public.progress_entries
for all
using (exists (
  select 1 from public.goals g
  where g.id = goal_id and g.user_id = auth.uid()
))
with check (true);

-- INDEXES FOR PERFORMANCE
create index idx_goals_user_id on public.goals(user_id);
create index idx_goals_category on public.goals(category);
create index idx_goals_status on public.goals(status);
create index idx_milestones_goal_id on public.milestones(goal_id);
create index idx_progress_entries_goal_id on public.progress_entries(goal_id);
create index idx_progress_entries_entry_date on public.progress_entries(entry_date);

-- FUNCTIONS FOR ANALYTICS
create or replace function get_goal_progress(goal_uuid uuid)
returns table (
  entry_date date,
  value numeric,
  cumulative_value numeric
) as $$
begin
  return query
  select 
    pe.entry_date,
    pe.value,
    sum(pe.value) over (order by pe.entry_date) as cumulative_value
  from public.progress_entries pe
  where pe.goal_id = goal_uuid
  order by pe.entry_date;
end;
$$ language plpgsql security definer;

-- Function to get goals by category for current user
create or replace function get_goals_by_category()
returns table (
  category goal_category,
  count bigint
) as $$
begin
  return query
  select g.category, count(*)
  from public.goals g
  where g.user_id = auth.uid()
  group by g.category;
end;
$$ language plpgsql security definer; 