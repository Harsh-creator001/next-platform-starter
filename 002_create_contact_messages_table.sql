-- Create profiles table for user portfolio data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  whatsapp text,
  github_url text,
  linkedin_url text,
  twitter_url text,
  about_text text,
  profile_images jsonb default '[]'::jsonb,
  resume_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create experience table
create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  position text not null,
  company text not null,
  duration text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.experience enable row level security;

create policy "experience_select_own"
  on public.experience for select
  using (auth.uid() = user_id);

create policy "experience_insert_own"
  on public.experience for insert
  with check (auth.uid() = user_id);

create policy "experience_update_own"
  on public.experience for update
  using (auth.uid() = user_id);

create policy "experience_delete_own"
  on public.experience for delete
  using (auth.uid() = user_id);

-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  technologies text[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create skills table
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  skill_list text[],
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.skills enable row level security;

create policy "skills_select_own"
  on public.skills for select
  using (auth.uid() = user_id);

create policy "skills_insert_own"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "skills_update_own"
  on public.skills for update
  using (auth.uid() = user_id);

create policy "skills_delete_own"
  on public.skills for delete
  using (auth.uid() = user_id);

-- Create trigger for auto-creating profiles on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'User'),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
