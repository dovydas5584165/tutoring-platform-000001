-- Run once in the Supabase SQL editor.
-- Invoices contain client names and amounts, so the "invoices" bucket must NOT be public.
-- Teacher photos stay public on purpose (they are shown on the website with the teachers' consent).

update storage.buckets set public = false where id = 'invoices';

-- Only logged-in tutors may upload invoices; nobody can list or download them through the public API.
-- (Admins can still see them in the Supabase dashboard.)
drop policy if exists "tutors upload invoices" on storage.objects;
create policy "tutors upload invoices"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'invoices'
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'tutor')
  );

-- The tutor dashboard uploads with upsert: true, which also needs UPDATE on the tutor's own files.
drop policy if exists "tutors update own invoices" on storage.objects;
create policy "tutors update own invoices"
  on storage.objects for update to authenticated
  using (bucket_id = 'invoices' and owner = auth.uid());

-- Check: this should return public = false
select id, public from storage.buckets where id in ('invoices', 'teacher photos');
