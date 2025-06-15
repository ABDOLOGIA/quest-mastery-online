
-- Remove existing restrictive policies and create teacher-friendly ones
DROP POLICY IF EXISTS "Teachers full access to exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers full access to subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admin approval required" ON public.exams;

-- Create simplified teacher policies for exams
CREATE POLICY "Teachers create and manage exams" ON public.exams
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Create simplified teacher policies for subjects
CREATE POLICY "Teachers create and view subjects" ON public.subjects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('teacher', 'admin', 'student')
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'teacher'
  )
);

-- Ensure creator_id is properly set and not null
ALTER TABLE public.exams 
ALTER COLUMN creator_id SET NOT NULL;

-- Update questions policy to be simpler
DROP POLICY IF EXISTS "Teachers full access to questions" ON public.questions;
CREATE POLICY "Teachers manage questions" ON public.questions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.profiles p ON e.creator_id = p.id
    WHERE questions.exam_id = e.id 
    AND p.id = auth.uid() 
    AND p.role = 'teacher'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.exams e
    JOIN public.profiles p ON e.creator_id = p.id
    WHERE questions.exam_id = e.id 
    AND p.id = auth.uid() 
    AND p.role = 'teacher'
  )
);
