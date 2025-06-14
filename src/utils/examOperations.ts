
import { supabase } from '../lib/supabase';
import { Exam, ExamAttempt, StudentExam } from '../types/exam';

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

export const loadStudentExamsFromDatabase = async (user: any): Promise<StudentExam[]> => {
  if (!user) return [];

  try {
    if (user.role === 'student') {
      // Students see only their own exam attempts
      const { data, error } = await supabase
        .from('student_exams')
        .select('*')
        .eq('student_id', user.id);

      if (error) {
        console.error('Error loading student exams:', error);
        return [];
      }

      if (data) {
        const formattedStudentExams: StudentExam[] = data.map(se => ({
          id: se.id,
          studentId: se.student_id,
          examId: se.exam_id,
          startedAt: new Date(se.started_at),
          submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
          answers: se.answers as Record<string, string | string[]>,
          score: se.score,
          isGraded: se.is_graded,
          isSubmitted: se.is_submitted,
          timeSpent: se.time_spent
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
        .eq('exams.teacher_id', user.id);

      if (error) {
        console.error('Error loading student exams for teacher:', error);
        return [];
      }

      if (data) {
        const formattedStudentExams: StudentExam[] = data.map(se => ({
          id: se.id,
          studentId: se.student_id,
          examId: se.exam_id,
          startedAt: new Date(se.started_at),
          submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
          answers: se.answers as Record<string, string | string[]>,
          score: se.score,
          isGraded: se.is_graded,
          isSubmitted: se.is_submitted,
          timeSpent: se.time_spent
        }));

        return formattedStudentExams;
      }
    }
  } catch (error) {
    console.error('Error in loadStudentExamsFromDatabase:', error);
  }

  return [];
};

export const getAllStudentsFromDatabase = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('name');

    if (error) {
      console.error('Error loading students:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStudentsFromDatabase:', error);
    return [];
  }
};

export const submitExamToDatabase = async (
  currentAttempt: ExamAttempt,
  currentExam: Exam,
  user: any
): Promise<{ score: number; timeSpent: number }> => {
  let score = 0;
  currentExam.questions.forEach(question => {
    const userAnswer = currentAttempt.answers[question.id];
    if (userAnswer && userAnswer === question.correctAnswer) {
      score += question.points;
    }
  });

  const timeSpent = Math.floor((new Date().getTime() - currentAttempt.startTime.getTime()) / 1000);

  // Insert into student_exams table
  const { error: studentExamError } = await supabase
    .from('student_exams')
    .insert({
      exam_id: currentExam.id,
      student_id: user.id,
      answers: currentAttempt.answers,
      score,
      is_graded: true,
      is_submitted: true,
      time_spent: timeSpent,
      submitted_at: new Date().toISOString()
    });

  if (studentExamError) {
    console.error('Error submitting to student_exams:', studentExamError);
  }

  // Also insert into exam_results for compatibility
  const { error } = await supabase
    .from('exam_results')
    .insert({
      exam_id: currentExam.id,
      student_id: user.id,
      answers: currentAttempt.answers,
      score,
      total_marks: currentExam.totalPoints,
      started_at: currentAttempt.startTime.toISOString(),
      completed_at: new Date().toISOString(),
      is_completed: true
    });

  if (error) {
    console.error('Error submitting exam:', error);
    throw error;
  }

  return { score, timeSpent };
};
