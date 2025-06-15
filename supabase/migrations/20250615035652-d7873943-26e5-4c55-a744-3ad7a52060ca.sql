
-- Drop existing restrictive policies first
DROP POLICY IF EXISTS "Teachers and admins can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers manage their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create questions for their exams" ON public.questions;
DROP POLICY IF EXISTS "Students view published exams" ON public.exams;

-- Create comprehensive policies for subjects
CREATE POLICY "Teachers full access to subjects" ON public.subjects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- Create comprehensive policies for exams
CREATE POLICY "Teachers full access to exams" ON public.exams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- Create comprehensive policies for questions
CREATE POLICY "Teachers full access to questions" ON public.questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.profiles p ON e.teacher_id = p.id
    WHERE questions.exam_id = e.id 
    AND p.id = auth.uid() 
    AND p.role IN ('teacher', 'admin')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.profiles p ON e.teacher_id = p.id
    WHERE questions.exam_id = e.id 
    AND p.id = auth.uid() 
    AND p.role IN ('teacher', 'admin')
  )
);

-- Ensure teachers can view all subjects (for selection in exam creation)
CREATE POLICY "Teachers can view all subjects" ON public.subjects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin', 'student')
  )
);

-- Students can only view published exams (recreated with proper name)
CREATE POLICY "Students view published exams only" ON public.exams
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'student'
  ) AND is_published = true
);
