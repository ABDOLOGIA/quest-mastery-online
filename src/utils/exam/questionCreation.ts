
import { supabase } from '../../lib/supabase';

export const createQuestionsWithErrorHandling = async (examId: string, questions: any[]) => {
  try {
    const questionsData = questions.map((question, index) => ({
      exam_id: examId,
      question_text: question.question.trim(),
      question_type: question.type,
      options: question.options || null,
      correct_answer: Array.isArray(question.correctAnswer) 
        ? question.correctAnswer.join(',') 
        : question.correctAnswer || '',
      marks: question.points,
      order_number: index + 1
    }));

    console.log('Creating questions:', questionsData);

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsData);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      
      if (questionsError.code === '42501') {
        throw new Error('Permission denied: Unable to create questions. Please contact an administrator.');
      } else if (questionsError.code === '23502') {
        throw new Error('Question validation failed: All questions must have valid text and answers.');
      } else {
        throw new Error(`Questions could not be saved: ${questionsError.message}. The exam was created but you can add questions later.`);
      }
    }

    console.log('Questions created successfully');
  } catch (error) {
    console.error('Error in createQuestionsWithErrorHandling:', error);
    throw error;
  }
};
