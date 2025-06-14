
-- Create student_exams table for tracking exam attempts
CREATE TABLE public.student_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '{}',
  score INTEGER,
  is_graded BOOLEAN DEFAULT false,
  is_submitted BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, exam_id)
);

-- Enable RLS on student_exams
ALTER TABLE student_exams ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_exams
CREATE POLICY "Students can view their own exam attempts"
ON student_exams FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own exam attempts"
ON student_exams FOR INSERT
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own exam attempts"
ON student_exams FOR UPDATE
USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view exam attempts for their exams"
ON student_exams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM exams 
    WHERE exams.id = student_exams.exam_id 
    AND exams.teacher_id = auth.uid()
  )
);

-- Create function to get teacher's students count
CREATE OR REPLACE FUNCTION get_teacher_students_count()
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM profiles
  WHERE role = 'student';
$$;

-- Create function to get teacher pending grading count (using new table)
CREATE OR REPLACE FUNCTION get_teacher_pending_grading_new(teacher_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM student_exams se
  JOIN exams e ON se.exam_id = e.id
  WHERE e.teacher_id = teacher_id_param
    AND se.is_submitted = true
    AND se.is_graded = false;
$$;

-- Create function to get active exams count for teacher
CREATE OR REPLACE FUNCTION get_teacher_active_exams_count(teacher_id_param UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM exams
  WHERE teacher_id = teacher_id_param
    AND is_published = true
    AND (end_time IS NULL OR end_time > now());
$$;

-- Enable realtime for new table
ALTER TABLE student_exams REPLICA IDENTITY FULL;

-- Add new table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE student_exams;
