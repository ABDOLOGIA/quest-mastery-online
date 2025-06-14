
import { supabase } from '../../lib/supabase';
import { ExamAttempt } from '../../types/exam';

export const loadAttemptsFromDatabase = async (user: any): Promise<ExamAttempt[]> => {
  if (!user) return [];

  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('student_id', user.id);

  if (error) {
    console.error('Error loading attempts:', error);
    return [];
  }

  if (data) {
    const formattedAttempts: ExamAttempt[] = data.map(result => ({
      id: result.id,
      examId: result.exam_id,
      studentId: result.student_id,
      answers: result.answers as Record<string, string | string[]>,
      startTime: new Date(result.started_at),
      endTime: result.completed_at ? new Date(result.completed_at) : undefined,
      score: result.score,
      isCompleted: result.is_completed,
      timeSpent: 0,
      warnings: []
    }));

    return formattedAttempts;
  }

  return [];
};
