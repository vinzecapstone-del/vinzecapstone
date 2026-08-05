alter table public.profiles
  add column if not exists valid_id_url text;

create policy "profile_valid_id_upload_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
