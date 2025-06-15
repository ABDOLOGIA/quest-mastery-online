
import { supabase } from '../../lib/supabase';
import { StudentExam } from '../../types/exam';

export const loadStudentExamsFromDatabase = async (user: any): Promise<StudentExam[]> => {
  if (!user) return [];

  try {
    if (user.role === 'student') {
      // Students see only their own exam attempts
      const { data, error } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading student exams:', error);
        return [];
      }

      if (data) {
        const formattedStudentExams: StudentExam[] = data.map(se => ({
          id: se.id,
          studentId: se.student_id,
          examId: se.exam_id,
          startedAt: new Date(se.started_at || se.created_at),
          submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
          answers: se.answers as Record<string, string | string[]>,
          score: se.score,
          isGraded: se.is_graded,
          isSubmitted: se.is_submitted,
          timeSpent: se.time_spent || 0
        }));

        return formattedStudentExams;
      }
    } else if (user.role === 'teacher') {
      // Teachers see student exams for their exams
      const { data, error } = await supabase
        .from('student_exams')
        .select(`
          *,
          exams!inner(teacher_id)
        `)
        .eq('exams.teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading student exams for teacher:', error);
        return [];
      }

      if (data) {
        const formattedStudentExams: StudentExam[] = data.map(se => ({
          id: se.id,
          studentId: se.student_id,
          examId: se.exam_id,
          startedAt: new Date(se.started_at || se.created_at),
          submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
          answers: se.answers as Record<string, string | string[]>,
          score: se.score,
          isGraded: se.is_graded,
          isSubmitted: se.is_submitted,
          timeSpent: se.time_spent || 0
        }));

        return formattedStudentExams;
      }
    }
  } catch (error) {
    console.error('Error in loadStudentExamsFromDatabase:', error);
  }

  return [];
};
