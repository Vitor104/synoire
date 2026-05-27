-- Server clock for client timer sync (offset vs local Date.now()).
create or replace function public.get_server_time()
returns timestamptz
language sql
stable
security invoker
set search_path = public
as $$
  select now();
$$;

grant execute on function public.get_server_time() to anon, authenticated;
