-- Invite tokens for private rooms/hubs: reusable links that grant access on redeem.

create table public.room_invite_tokens (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  token text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint room_invite_tokens_room_id_key unique (room_id),
  constraint room_invite_tokens_token_key unique (token)
);

create index room_invite_tokens_token_idx on public.room_invite_tokens (token);

create table public.hub_invite_tokens (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid not null references public.hubs (id) on delete cascade,
  token text not null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint hub_invite_tokens_hub_id_key unique (hub_id),
  constraint hub_invite_tokens_token_key unique (token)
);

create index hub_invite_tokens_token_idx on public.hub_invite_tokens (token);

alter table public.room_invite_tokens enable row level security;
alter table public.hub_invite_tokens enable row level security;

create policy "Room creators manage invite tokens"
  on public.room_invite_tokens
  for all
  to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1
      from public.rooms r
      where r.id = room_id
        and r.creator_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.rooms r
      where r.id = room_id
        and r.creator_id = auth.uid()
    )
  );

create policy "Hub creators manage invite tokens"
  on public.hub_invite_tokens
  for all
  to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1
      from public.hubs h
      where h.id = hub_id
        and h.creator_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    and exists (
      select 1
      from public.hubs h
      where h.id = hub_id
        and h.creator_id = auth.uid()
    )
  );

create or replace function public.redeem_room_invite(p_room_id uuid, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false);
  end if;

  if not exists (
    select 1
    from public.room_invite_tokens t
    where t.room_id = p_room_id
      and t.token = p_token
  ) then
    return jsonb_build_object('ok', false);
  end if;

  insert into public.room_access (room_id, user_id)
  values (p_room_id, v_user_id)
  on conflict do nothing;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.redeem_hub_invite(p_hub_id uuid, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false);
  end if;

  if not exists (
    select 1
    from public.hub_invite_tokens t
    where t.hub_id = p_hub_id
      and t.token = p_token
  ) then
    return jsonb_build_object('ok', false);
  end if;

  insert into public.hub_access (hub_id, user_id)
  values (p_hub_id, v_user_id)
  on conflict do nothing;

  insert into public.user_hubs (user_id, hub_id)
  values (v_user_id, p_hub_id)
  on conflict do nothing;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.redeem_room_invite(uuid, text) from public;
revoke all on function public.redeem_hub_invite(uuid, text) from public;

grant execute on function public.redeem_room_invite(uuid, text) to authenticated;
grant execute on function public.redeem_hub_invite(uuid, text) to authenticated;
