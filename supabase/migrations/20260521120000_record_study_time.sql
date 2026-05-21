-- study_sessions table + atomic record_study_time RPC (hours, streak, session row)

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  room_id uuid not null,
  duration_minutes integer not null check (duration_minutes >= 1),
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_created_idx
  on public.study_sessions (user_id, created_at desc);

alter table public.study_sessions enable row level security;

drop policy if exists "study_sessions_select_own" on public.study_sessions;
create policy "study_sessions_select_own"
  on public.study_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "study_sessions_insert_own" on public.study_sessions;
create policy "study_sessions_insert_own"
  on public.study_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.record_study_time(
  p_room_id uuid,
  p_duration_minutes integer
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date;
  v_had_session_today boolean;
  v_last_day date;
  v_session_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if p_duration_minutes < 1 then
    raise exception 'duration must be at least 1 minute';
  end if;

  if not exists (select 1 from public.rooms where id = p_room_id) then
    raise exception 'room not found';
  end if;

  v_today := (timezone('America/Sao_Paulo', now()))::date;

  select exists (
    select 1
    from public.study_sessions s
    where s.user_id = v_user_id
      and (timezone('America/Sao_Paulo', s.created_at))::date = v_today
  )
  into v_had_session_today;

  insert into public.study_sessions (user_id, room_id, duration_minutes)
  values (v_user_id, p_room_id, p_duration_minutes)
  returning id into v_session_id;

  update public.user_stats
  set
    total_hours = total_hours + (p_duration_minutes::numeric / 60.0),
    updated_at = now()
  where user_id = v_user_id;

  if not v_had_session_today then
    select max((timezone('America/Sao_Paulo', s.created_at))::date)
    into v_last_day
    from public.study_sessions s
    where s.user_id = v_user_id
      and (timezone('America/Sao_Paulo', s.created_at))::date < v_today;

    if v_last_day = v_today - 1 then
      update public.user_stats
      set
        current_streak = current_streak + 1,
        updated_at = now()
      where user_id = v_user_id;
    else
      update public.user_stats
      set
        current_streak = 1,
        updated_at = now()
      where user_id = v_user_id;
    end if;
  end if;

  return v_session_id;
end;
$$;

revoke all on function public.record_study_time(uuid, integer) from public;
grant execute on function public.record_study_time(uuid, integer) to authenticated;
