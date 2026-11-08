-- Run once in the Supabase SQL editor, AFTER deploying the code that comes with it.
-- Closes the database to the browser for payment data and adds constraints that prevent races.
--
-- Since this deploy, every write to bookings / payments / purchases / notifications happens in API
-- routes with the service-role key (which bypasses RLS). The browser (anon key) only needs to READ
-- some bookings, so it gets no write access at all.

-- 0) Look first: list existing policies. Any policy that lets `anon` (or everyone) INSERT/UPDATE/DELETE
--    on these tables is how "open database" attacks happen (e.g. marking a booking as paid,
--    changing its total_price). Remove those by name with:  drop policy "<name>" on public.<table>;
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('bookings', 'payments', 'purchases', 'notifications', 'availability', 'users');

-- 1) Career test purchases (phone numbers): server only.
alter table public.purchases enable row level security;
revoke insert, update, delete on public.purchases from anon, authenticated;

-- 2) Payments: server only.
alter table public.payments enable row level security;
revoke insert, update, delete on public.payments from anon, authenticated;
-- Stripe retries webhooks; this makes a double-recorded payment impossible
create unique index if not exists payments_stripe_payment_id_key
  on public.payments (stripe_payment_id) where stripe_payment_id is not null;

-- 3) Bookings: nobody may change price or payment status from the browser.
--    (Reads are left to your existing SELECT policies: the payment-success page and the
--     student dashboard read bookings with the anon key.)
alter table public.bookings enable row level security;
revoke insert, update, delete on public.bookings from anon, authenticated;

-- 4) Lesson requests: one open request per email + subject even if the form is submitted twice at once.
--    (If this fails with "could not create unique index", close the duplicate open requests first.)
create unique index if not exists lesson_requests_one_open_per_email_subject
  on public.lesson_requests (email, lower(subject)) where status = 'open';

-- 5) Check: should be true for every row
select relname, relrowsecurity
from pg_class
where relname in ('bookings', 'payments', 'purchases', 'notifications', 'lesson_requests', 'access_codes', 'teacher_profiles');
