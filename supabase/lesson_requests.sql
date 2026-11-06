-- Run once in the Supabase SQL editor.
-- Lesson requests: a client picks 5+ possible times, a tutor claims one of them.

create table if not exists public.lesson_requests (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  student_name  text not null,
  grade         text not null,
  subject       text not null,          -- lessons.name, e.g. "matematika"
  topic         text,
  email         text not null,
  phone         text,

  slots         timestamptz[] not null, -- the times the client can attend
  status        text not null default 'open'
                check (status in ('open', 'claimed', 'cancelled')),

  tutor_id      uuid references public.users(id) on delete set null,
  chosen_slot   timestamptz,
  claimed_at    timestamptz,

  constraint lesson_requests_min_slots check (cardinality(slots) >= 5),
  constraint lesson_requests_claim_complete check (
    status <> 'claimed' or (tutor_id is not null and chosen_slot is not null)
  )
);

create index if not exists lesson_requests_open_subject_idx
  on public.lesson_requests (subject) where status = 'open';
create index if not exists lesson_requests_tutor_idx
  on public.lesson_requests (tutor_id);

-- Everything goes through the API routes with the service role key,
-- so the table is closed to the browser: no policies = no anon/auth access.
alter table public.lesson_requests enable row level security;
