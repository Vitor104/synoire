-- stripe-webhook uses service_role; RLS is bypassed but table GRANTs are still required.
grant select, insert, update, delete on table public.profiles to service_role;
