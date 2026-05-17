-- Synoire Glow: plan tier on profiles
alter table public.profiles
  add column if not exists plan_tier text not null default 'free'
    constraint profiles_plan_tier_check
    check (plan_tier in ('free', 'glow', 'collective'));
