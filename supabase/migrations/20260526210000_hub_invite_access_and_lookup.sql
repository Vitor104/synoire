create or replace function public.grant_hub_access(p_hub_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
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

create or replace function public.resolve_hub_invite_target(p_slug text, p_token text)
returns table (
  id uuid,
  name text,
  slug text,
  is_private boolean,
  creator_id uuid,
  icon_emoji text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_slug), '') = '' or coalesce(trim(p_token), '') = '' then
    return;
  end if;

  return query
  select h.id, h.name, h.slug, h.is_private, h.creator_id, h.icon_emoji
  from public.hubs h
  inner join public.hub_invite_tokens hit
    on hit.hub_id = h.id
  where h.slug = trim(p_slug)
    and hit.token = trim(p_token)
  limit 1;
end;
$$;

revoke all on function public.grant_hub_access(uuid, uuid) from public;
revoke all on function public.resolve_hub_invite_target(text, text) from public;

grant execute on function public.grant_hub_access(uuid, uuid) to authenticated;
grant execute on function public.resolve_hub_invite_target(text, text) to authenticated;
