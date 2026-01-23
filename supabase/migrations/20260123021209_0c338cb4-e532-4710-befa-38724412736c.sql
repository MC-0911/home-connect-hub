-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Recreate policies idempotently
drop policy if exists "Blog images are publicly readable" on storage.objects;
drop policy if exists "Admins can upload blog images" on storage.objects;
drop policy if exists "Admins can update blog images" on storage.objects;
drop policy if exists "Admins can delete blog images" on storage.objects;

create policy "Blog images are publicly readable"
on storage.objects
for select
using (bucket_id = 'blog-images');

create policy "Admins can upload blog images"
on storage.objects
for insert
with check (
  bucket_id = 'blog-images'
  and auth.role() = 'authenticated'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);

create policy "Admins can update blog images"
on storage.objects
for update
using (
  bucket_id = 'blog-images'
  and auth.role() = 'authenticated'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);

create policy "Admins can delete blog images"
on storage.objects
for delete
using (
  bucket_id = 'blog-images'
  and auth.role() = 'authenticated'
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);