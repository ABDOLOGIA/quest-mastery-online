
-- Create a security definer function to get profile by student ID
-- This helps avoid RLS infinite recursion issues
CREATE OR REPLACE FUNCTION public.get_profile_by_student_id(student_id_param TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  role TEXT,
  student_id TEXT,
  department TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.email,
    p.name,
    p.role::TEXT,
    p.student_id,
    p.department
  FROM public.profiles p
  WHERE p.student_id = student_id_param
  LIMIT 1;
$$;

-- Fix RLS policies to prevent infinite recursion
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view department students" ON public.profiles;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$;

-- Recreate policies using security definer functions to avoid recursion
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Teachers can view student profiles" ON public.profiles
  FOR SELECT USING (
    public.get_current_user_role() = 'teacher' AND role::TEXT = 'student'
  );

-- Allow public access for authentication purposes (student ID lookup)
CREATE POLICY "Allow student ID lookup for authentication" ON public.profiles
  FOR SELECT USING (true);
