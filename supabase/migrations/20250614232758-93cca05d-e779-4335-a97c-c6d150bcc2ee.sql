
-- Update existing profiles table to match our enhanced structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE public.profiles SET full_name = name WHERE full_name IS NULL;

-- Ensure role column has proper constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role::text IN ('admin', 'teacher', 'student'));
  END IF;
END $$;

-- Role upgrade requests table
CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('teacher', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on role_requests
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_requests
DROP POLICY IF EXISTS "Users can create and view own requests" ON public.role_requests;
CREATE POLICY "Users can create and view own requests" ON public.role_requests
FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all role requests" ON public.role_requests;
CREATE POLICY "Admins manage all role requests" ON public.role_requests
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text = 'admin'
  )
);

-- Update existing subjects table if needed
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);

-- Update existing exams table to match new structure
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES public.profiles(id);
UPDATE public.exams SET creator_id = teacher_id WHERE creator_id IS NULL AND teacher_id IS NOT NULL;

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'exams_status_check'
  ) THEN
    ALTER TABLE public.exams ADD CONSTRAINT exams_status_check 
    CHECK (status IN ('draft', 'published', 'archived'));
  END IF;
END $$;

ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS total_points INTEGER;
UPDATE public.exams SET total_points = total_marks WHERE total_points IS NULL AND total_marks IS NOT NULL;

-- Update existing exam_results table
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'exam_results_status_check'
  ) THEN
    ALTER TABLE public.exam_results ADD CONSTRAINT exam_results_status_check 
    CHECK (status IN ('in_progress', 'submitted', 'graded'));
  END IF;
END $$;

-- Enhanced RLS Policies for exams
DROP POLICY IF EXISTS "Teachers manage their own exams" ON public.exams;
CREATE POLICY "Teachers manage their own exams" ON public.exams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text IN ('teacher', 'admin')
  ) AND (
    creator_id = auth.uid() OR teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role::text = 'admin'
    )
  )
);

DROP POLICY IF EXISTS "Students view published exams" ON public.exams;
CREATE POLICY "Students view published exams" ON public.exams
FOR SELECT USING (
  is_published = true AND
  (start_time IS NULL OR start_time <= NOW()) AND
  (end_time IS NULL OR end_time >= NOW())
);

-- Function to verify user role (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.verify_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role::text = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role::text FROM public.profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to handle role request approval
CREATE OR REPLACE FUNCTION public.approve_role_request(request_id UUID, approve BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role::text = 'admin'
  ) THEN
    RETURN FALSE;
  END IF;

  -- Get the request details
  SELECT * INTO request_record 
  FROM public.role_requests 
  WHERE id = request_id AND status = 'pending';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update request status
  UPDATE public.role_requests 
  SET 
    status = CASE WHEN approve THEN 'approved' ELSE 'rejected' END,
    reviewed_by = auth.uid(),
    reviewed_at = NOW()
  WHERE id = request_id;

  -- If approved, update user role
  IF approve THEN
    UPDATE public.profiles 
    SET role = request_record.requested_role::user_role
    WHERE id = request_record.user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
