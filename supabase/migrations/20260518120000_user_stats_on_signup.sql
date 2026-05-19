-- Bootstrap user_stats for new accounts and extend signup trigger

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak integer not null default 0,
  total_hours numeric not null default 0,
  daily_goal_minutes integer not null default 240,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists "user_stats_select_own" on public.user_stats;
create policy "user_stats_select_own"
  on public.user_stats
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_stats_update_own" on public.user_stats;
create policy "user_stats_update_own"
  on public.user_stats
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

  insert into public.user_stats (user_id, current_streak, total_hours, daily_goal_minutes)
  values (new.id, 0, 0, 240)
  on conflict (user_id) do nothing;

  return new;
end;
$$;
