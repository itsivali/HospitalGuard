-- Temporary policy to allow inserting hospital staff records
-- Run this in your Supabase SQL Editor if you don't want to use service role key

-- Create a policy that allows anyone to insert staff (TEMPORARY - for development only)
CREATE POLICY "Allow staff insert for development" ON hospital_staff
  FOR INSERT
  WITH CHECK (true);

-- IMPORTANT: Remove this policy in production!
-- To remove: DROP POLICY "Allow staff insert for development" ON hospital_staff;
