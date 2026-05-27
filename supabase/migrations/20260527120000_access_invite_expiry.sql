-- Invite cooldown (24h) for direct partner grants on private rooms/hubs.

alter table public.room_access
  add column if not exists accepted_at timestamptz null;

create or replace function public.grant_room_access(p_room_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_existing public.room_access%rowtype;
  v_grant public.room_access%rowtype;
  v_rows_inserted bigint := 0;
begin
  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if p_room_id is null or p_user_id is null then
    raise exception 'Room and user are required.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.creator_id = v_actor_id
  ) then
    raise exception 'Only the room creator can invite partners.'
      using errcode = '42501';
  end if;

  select *
  into v_existing
  from public.room_access ra
  where ra.room_id = p_room_id
    and ra.user_id = p_user_id;

  if found then
    if v_existing.accepted_at is not null then
      return jsonb_build_object(
        'room_id', v_existing.room_id,
        'user_id', v_existing.user_id,
        'created_at', v_existing.created_at,
        'accepted_at', v_existing.accepted_at,
        'already_granted', true
      );
    end if;

    if v_existing.created_at > now() - interval '24 hours' then
      return jsonb_build_object(
        'room_id', v_existing.room_id,
        'user_id', v_existing.user_id,
        'created_at', v_existing.created_at,
        'accepted_at', v_existing.accepted_at,
        'already_granted', true
      );
    end if;

    delete from public.room_access
    where room_id = p_room_id
      and user_id = p_user_id;
  end if;

  insert into public.room_access (room_id, user_id)
  values (p_room_id, p_user_id);

  get diagnostics v_rows_inserted = row_count;

  select *
  into v_grant
  from public.room_access ra
  where ra.room_id = p_room_id
    and ra.user_id = p_user_id;

  return jsonb_build_object(
    'room_id', v_grant.room_id,
    'user_id', v_grant.user_id,
    'created_at', v_grant.created_at,
    'accepted_at', v_grant.accepted_at,
    'already_granted', v_rows_inserted = 0
  );
end;
$$;

create or replace function public.accept_room_access(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_grant public.room_access%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if p_room_id is null then
    raise exception 'Room is required.'
      using errcode = '22023';
  end if;

  update public.room_access
  set accepted_at = now()
  where room_id = p_room_id
    and user_id = v_user_id
    and accepted_at is null
  returning *
  into v_grant;

  if not found then
    return jsonb_build_object('ok', false);
  end if;

  return jsonb_build_object(
    'ok', true,
    'room_id', v_grant.room_id,
    'user_id', v_grant.user_id,
    'created_at', v_grant.created_at,
    'accepted_at', v_grant.accepted_at
  );
end;
$$;

create or replace function public.grant_hub_access(p_hub_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_existing public.hub_access%rowtype;
  v_rows_inserted bigint := 0;
  v_grant public.hub_access%rowtype;
begin
  if v_actor_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if p_hub_id is null or p_user_id is null then
    raise exception 'Hub and user are required.'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.hubs h
    where h.id = p_hub_id
      and h.creator_id = v_actor_id
  ) then
    raise exception 'Only the hub creator can invite members.'
      using errcode = '42501';
  end if;

  select *
  into v_existing
  from public.hub_access ha
  where ha.hub_id = p_hub_id
    and ha.user_id = p_user_id;

  if found then
    if v_existing.created_at > now() - interval '24 hours' then
      return jsonb_build_object(
        'hub_id', v_existing.hub_id,
        'user_id', v_existing.user_id,
        'created_at', v_existing.created_at,
        'already_granted', true
      );
    end if;

    delete from public.hub_access
    where hub_id = p_hub_id
      and user_id = p_user_id;
  end if;

  insert into public.hub_access (hub_id, user_id)
  values (p_hub_id, p_user_id)
  on conflict do nothing;

  get diagnostics v_rows_inserted = row_count;

  insert into public.user_hubs (user_id, hub_id)
  values (p_user_id, p_hub_id)
  on conflict do nothing;

  select *
  into v_grant
  from public.hub_access ha
  where ha.hub_id = p_hub_id
    and ha.user_id = p_user_id;

  return jsonb_build_object(
    'hub_id', v_grant.hub_id,
    'user_id', v_grant.user_id,
    'created_at', v_grant.created_at,
    'already_granted', v_rows_inserted = 0
  );
end;
$$;

revoke all on function public.grant_room_access(uuid, uuid) from public;
revoke all on function public.accept_room_access(uuid) from public;

grant execute on function public.grant_room_access(uuid, uuid) to authenticated;
grant execute on function public.accept_room_access(uuid) to authenticated;
