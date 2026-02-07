-- 🔴 SECURITY FIX: Block unauthenticated uploads
-- Previous Policy: "Everyone can upload images" (Allows Guest Uploads)
-- New Policy: "Authenticated users can upload images"

BEGIN;

-- 1. Drop the insecure policy
DROP POLICY IF EXISTS "Everyone can upload images" ON storage.objects;

-- 2. Create the new strict policy
-- Only users who are logged in (authenticated) can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'item-images' );

-- 3. Ensure "Public Access" for viewing still exists (for reading images)
-- (We don't drop the select policy as public reading is likely required)
-- If you need to ensure it exists:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'item-images' );

COMMIT;
