
import { supabase } from '../../lib/supabase';
import { ExamAttempt, Exam } from '../../types/exam';

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
