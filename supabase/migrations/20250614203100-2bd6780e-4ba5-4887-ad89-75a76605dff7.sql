
-- Add RLS policies for the existing tables to ensure proper access control

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Teachers can view their own exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can create exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can update their own exams" ON public.exams;
DROP POLICY IF EXISTS "Students can view published exams" ON public.exams;

DROP POLICY IF EXISTS "Teachers can view their exam questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can create questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can update their questions" ON public.questions;
DROP POLICY IF EXISTS "Students can view published exam questions" ON public.questions;

DROP POLICY IF EXISTS "Students can view their own results" ON public.exam_results;
DROP POLICY IF EXISTS "Students can create their own results" ON public.exam_results;
DROP POLICY IF EXISTS "Teachers can view results for their exams" ON public.exam_results;

DROP POLICY IF EXISTS "Everyone can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Teachers can create subjects" ON public.subjects;

-- Create RLS policies for exams table
CREATE POLICY "Teachers can view their own exams" ON public.exams
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can create exams" ON public.exams
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers can update their own exams" ON public.exams
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Students can view published exams" ON public.exams
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all exams" ON public.exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for questions table
CREATE POLICY "Teachers can view their exam questions" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create questions" ON public.questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their questions" ON public.questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view published exam questions" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = questions.exam_id AND is_published = true
    )
  );

-- Create RLS policies for exam_results table
CREATE POLICY "Students can view their own results" ON public.exam_results
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can create their own results" ON public.exam_results
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view results for their exams" ON public.exam_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams 
      WHERE id = exam_results.exam_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all results" ON public.exam_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for subjects table
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage subjects" ON public.subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can create subjects" ON public.subjects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

-- Add foreign key constraints that were missing
ALTER TABLE public.exams 
ADD CONSTRAINT fk_exams_subject FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
ADD CONSTRAINT fk_exams_teacher FOREIGN KEY (teacher_id) REFERENCES public.profiles(id);

ALTER TABLE public.questions 
ADD CONSTRAINT fk_questions_exam FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;

ALTER TABLE public.exam_results 
ADD CONSTRAINT fk_exam_results_exam FOREIGN KEY (exam_id) REFERENCES public.exams(id),
ADD CONSTRAINT fk_exam_results_student FOREIGN KEY (student_id) REFERENCES public.profiles(id);

-- Create function to get student count for a teacher's department
CREATE OR REPLACE FUNCTION public.get_teacher_student_count(teacher_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.profiles teacher_profile
  JOIN public.profiles student_profiles ON (
    teacher_profile.department = student_profiles.department 
    OR student_profiles.role = 'student'
  )
  WHERE teacher_profile.id = teacher_id_param 
    AND teacher_profile.role = 'teacher'
    AND student_profiles.role = 'student';
$$;

-- Create function to get pending grading count for a teacher
CREATE OR REPLACE FUNCTION public.get_pending_grading_count(teacher_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.exam_results er
  JOIN public.exams e ON er.exam_id = e.id
  WHERE e.teacher_id = teacher_id_param 
    AND er.is_completed = true
    AND er.score IS NULL;
$$;
