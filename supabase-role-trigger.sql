-- =====================================================
-- Supabase Trigger: Auto-assign user roles on signup
-- =====================================================
-- This trigger automatically inserts a user role when
-- a new user confirms their email and their account
-- is created in the auth.users table.
-- =====================================================

-- First, make sure the user_roles table has proper constraints
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role from user metadata (set during signup)
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'patient');

  -- Log for debugging (optional - remove in production)
  RAISE NOTICE 'Creating user role for user % with role %', NEW.id, user_role;

  -- Insert the role into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a trigger that runs after a user is inserted or updated
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Also handle users who are already confirmed on insert
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created_immediate ON auth.users;

CREATE TRIGGER on_auth_user_created_immediate
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Test the trigger (optional - comment out after testing)
-- =====================================================
-- SELECT handle_new_user() should be called automatically
-- You can check the logs to see if it's working

-- =====================================================
-- Explanation:
-- =====================================================
-- 1. When a user signs up, their role is stored in metadata
-- 2. Two triggers handle role assignment:
--    a) When user confirms email (UPDATE trigger)
--    b) When user is created already confirmed (INSERT trigger)
-- 3. Uses COALESCE to default to 'patient' if no role
-- 4. ON CONFLICT DO UPDATE ensures role is set even if entry exists
-- 5. Error handling prevents user creation from failing
-- 6. RAISE NOTICE helps with debugging
-- =====================================================
