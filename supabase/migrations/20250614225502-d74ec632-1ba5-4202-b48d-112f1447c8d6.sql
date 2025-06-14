
-- Update RLS policies to allow teachers to create subjects and exams

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can manage their exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create exams" ON public.exams;

-- Create policy for teachers to create subjects
CREATE POLICY "Teachers and admins can create subjects" ON public.subjects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Create policy for teachers to manage their own exams
CREATE POLICY "Teachers can manage their own exams" ON public.exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        (role = 'teacher' AND auth.uid() = exams.teacher_id)
      )
    )
  );

-- Ensure teachers can insert exams they create
CREATE POLICY "Teachers can create exams" ON public.exams
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Update questions policy to allow teachers to create questions for their exams
DROP POLICY IF EXISTS "Teachers can create questions" ON public.questions;
CREATE POLICY "Teachers can create questions for their exams" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND teacher_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
