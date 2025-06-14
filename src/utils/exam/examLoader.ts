
import { supabase } from '../../lib/supabase';
import { Exam } from '../../types/exam';

export const loadExamsFromDatabase = async (user: any): Promise<Exam[]> => {
  console.log('Loading exams for user:', user.id, 'role:', user.role);
  
  let query = supabase.from('exams').select(`
    *,
    subjects!exams_subject_id_fkey(name),
    questions!fk_questions_exam(*)
  `);

  // Students can only see published exams
  if (user.role === 'student') {
    query = query.eq('is_published', true);
  }
  // Teachers see their own exams
  else if (user.role === 'teacher') {
    query = query.eq('teacher_id', user.id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading exams:', error);
    throw error;
  }

  console.log('Loaded exams data:', data);

  if (data) {
    const formattedExams: Exam[] = data.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description || '',
      subject: exam.subjects?.name || 'General',
      duration: exam.duration_minutes,
      startTime: new Date(exam.start_time || Date.now()),
      endTime: new Date(exam.end_time || Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalPoints: exam.total_marks,
      isActive: exam.is_published,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: exam.teacher_id,
      alwaysAvailable: !exam.start_time,
      questions: exam.questions?.map((q: any) => ({
        id: q.id,
        type: q.question_type as 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer',
        question: q.question_text,
        options: q.options || [],
        correctAnswer: q.correct_answer,
        points: q.marks,
        category: 'General',
        difficulty: 'medium' as const
      })) || []
    }));

    console.log('Formatted exams:', formattedExams);
    return formattedExams;
  }

  return [];
};
