-- Storage Bucket Policies for car-images
-- Execute these in Supabase SQL Editor after creating the bucket

-- Enable RLS on storage.objects (usually enabled by default)
alter table storage.objects enable row level security;

-- Policy: Public read access to car-images bucket
create policy "Public read car-images"
on storage.objects for select
using (bucket_id = 'car-images');

-- Policy: Authenticated users can upload to car-images bucket
create policy "Auth upload car-images"
on storage.objects for insert
with check (bucket_id = 'car-images' and auth.uid() is not null);

-- Policy: Authenticated users can update their uploads in car-images bucket
create policy "Auth update car-images"
on storage.objects for update
using (bucket_id = 'car-images' and auth.uid() is not null)
with check (bucket_id = 'car-images' and auth.uid() is not null);

-- Policy: Authenticated users can delete from car-images bucket
create policy "Auth delete car-images"
on storage.objects for delete
using (bucket_id = 'car-images' and auth.uid() is not null);

-- Optional: Restrict file types and size (if needed)
-- create policy "Car images only" on storage.objects for insert
-- with check (
--   bucket_id = 'car-images' and
--   auth.uid() is not null and
--   (storage.mimetype = 'image/jpeg' or storage.mimetype = 'image/png' or storage.mimetype = 'image/webp') and
--   octet_length(storage.object) < 5242880 -- 5MB
-- );