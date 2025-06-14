
-- Ensure student_id column exists and add index for faster lookups
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS student_id TEXT;

-- Create index on student_id for faster login lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);

-- Add constraint to ensure student_id is unique when not null
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_student_id UNIQUE (student_id);

-- Update the handle_new_user function to properly save student_id from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Insert profile with all user metadata including student_id
  INSERT INTO public.profiles (id, email, name, role, department, student_id, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    new.raw_user_meta_data->>'department',
    new.raw_user_meta_data->>'studentId',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    student_id = EXCLUDED.student_id,
    updated_at = now();
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$;
