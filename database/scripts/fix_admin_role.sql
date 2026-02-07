-- Replace 'YOUR_EMAIL_HERE' with your actual email address
-- Run this in the Supabase SQL Editor

UPDATE public.profiles
SET role = 'admin'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND auth.users.email = 'YOUR_EMAIL_HERE';

-- Verification
SELECT email, role 
FROM public.profiles 
JOIN auth.users ON public.profiles.id = auth.users.id
WHERE auth.users.email = 'YOUR_EMAIL_HERE';
