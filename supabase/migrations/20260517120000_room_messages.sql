-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 2 and 32)
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Room chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint messages_content_length check (
    char_length(trim(content)) between 1 and 500
  )
);

create index if not exists messages_room_created_idx
  on public.messages (room_id, created_at desc);

-- Enables PostgREST embed: messages.select('*, profiles(...)')
alter table public.messages
  add constraint messages_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.messages enable row level security;

create policy "Authenticated users can read room messages"
  on public.messages
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert own messages"
  on public.messages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Realtime: broadcast new inserts to subscribers
alter publication supabase_realtime add table public.messages;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      split_part(new.email, '@', 1),
      'estudante'
    )
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
