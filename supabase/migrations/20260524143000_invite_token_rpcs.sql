revoke all on table public.room_invite_tokens from public, anon, authenticated;
revoke all on table public.hub_invite_tokens from public, anon, authenticated;

create or replace function public.get_or_create_room_invite_token(p_room_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_token text;
begin
  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.rooms r
    where r.id = p_room_id
      and r.creator_id = v_user_id
  ) then
    raise exception 'Only the room creator can manage invite links.'
      using errcode = '42501';
  end if;

  select t.token
  into v_token
  from public.room_invite_tokens t
  where t.room_id = p_room_id;

  if v_token is not null then
    return v_token;
  end if;

  loop
    v_token := replace(gen_random_uuid()::text, '-', '');

    begin
      insert into public.room_invite_tokens (room_id, token, created_by)
      values (p_room_id, v_token, v_user_id);

      return v_token;
    exception
      when unique_violation then
        select t.token
        into v_token
        from public.room_invite_tokens t
        where t.room_id = p_room_id;

        if v_token is not null then
          return v_token;
        end if;
    end;
  end loop;
end;
$$;

create or replace function public.get_or_create_hub_invite_token(p_hub_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_token text;
begin
  if v_user_id is null then
    raise exception 'Authentication required.'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.hubs h
    where h.id = p_hub_id
      and h.creator_id = v_user_id
  ) then
    raise exception 'Only the hub creator can manage invite links.'
      using errcode = '42501';
  end if;

  select t.token
  into v_token
  from public.hub_invite_tokens t
  where t.hub_id = p_hub_id;

  if v_token is not null then
    return v_token;
  end if;

  loop
    v_token := replace(gen_random_uuid()::text, '-', '');

    begin
      insert into public.hub_invite_tokens (hub_id, token, created_by)
      values (p_hub_id, v_token, v_user_id);

      return v_token;
    exception
      when unique_violation then
        select t.token
        into v_token
        from public.hub_invite_tokens t
        where t.hub_id = p_hub_id;

        if v_token is not null then
          return v_token;
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.get_or_create_room_invite_token(uuid) from public;
revoke all on function public.get_or_create_hub_invite_token(uuid) from public;

grant execute on function public.get_or_create_room_invite_token(uuid) to authenticated;
grant execute on function public.get_or_create_hub_invite_token(uuid) to authenticated;
