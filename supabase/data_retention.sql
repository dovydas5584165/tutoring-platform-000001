-- Run once in the Supabase SQL editor (Database → Extensions: enable "pg_cron" first).
-- Deletes personal data after the retention periods promised in the privacy policy
-- (/privatumo-politika, section 6). Runs every night at 03:15 UTC.
--
-- Check the table names match your project before running.

create extension if not exists pg_cron;

-- Lesson requests: 2 years after the last update.
select cron.schedule(
  'retention-lesson-requests',
  '15 3 * * *',
  $$ delete from public.lesson_requests where updated_at < now() - interval '2 years' $$
);

-- Group lesson registrations: 1 year.
select cron.schedule(
  'retention-group-registrations',
  '20 3 * * *',
  $$ delete from public.group_registrations where created_at < now() - interval '1 year' $$
);

-- Career test purchases: drop the phone number after 1 year, keep amount/status for accounting.
select cron.schedule(
  'retention-purchases-phone',
  '25 3 * * *',
  $$ update public.purchases set number = null where number is not null and created_at < now() - interval '1 year' $$
);

-- To see the jobs:   select * from cron.job;
-- To remove one:     select cron.unschedule('retention-lesson-requests');
