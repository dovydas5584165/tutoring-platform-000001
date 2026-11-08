-- Run once in the Supabase SQL editor.
-- Career test access codes for companies: each code works until expires_at.
-- Create new codes on /admin_access_codes (needs ADMIN_SECRET env var).

create table if not exists public.access_codes (
  code        text primary key,               -- stored lowercase
  company     text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  active      boolean not null default true,  -- false = turned off early
  uses        integer not null default 0
);

-- Keeps the code that was hardcoded before working for one more month
insert into public.access_codes (code, company, expires_at)
values ('gruzdziai', 'Senas kodas (gruzdziai)', now() + interval '1 month')
on conflict (code) do nothing;

-- Only the API (service role key) touches this table
alter table public.access_codes enable row level security;
