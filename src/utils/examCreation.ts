
import { supabase } from '../lib/supabase';
import { Exam } from '../types/exam';

export const createExamInDatabase = async (examData: Omit<Exam, 'id'>, user: any) => {
  console.log('Creating exam in database with data:', examData);
  console.log('User creating exam:', user);

  if (!user || !user.id) {
    throw new Error('User must be authenticated to create exams');
  }

  try {
    // First, create or get the subject
    let subjectId: string;
    
    const { data: existingSubject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', examData.subject)
      .single();

    if (existingSubject) {
      subjectId = existingSubject.id;
    } else {
      const { data: newSubject, error: createSubjectError } = await supabase
        .from('subjects')
        .insert({
          name: examData.subject,
          description: `Subject for ${examData.subject} exams`,
          created_by: user.id
        })
        .select('id')
        .single();

      if (createSubjectError) {
        console.error('Error creating subject:', createSubjectError);
        throw new Error(`Failed to create subject: ${createSubjectError.message}`);
      }

      subjectId = newSubject.id;
    }

    // Create the exam
    const examToInsert = {
      title: examData.title,
      description: examData.description,
      subject_id: subjectId,
      duration_minutes: examData.duration,
      start_time: examData.alwaysAvailable ? null : examData.startTime.toISOString(),
      end_time: examData.alwaysAvailable ? null : examData.endTime.toISOString(),
      total_marks: examData.totalPoints,
      is_published: examData.isActive,
      teacher_id: user.id,
      status: 'published'
    };

    console.log('Inserting exam:', examToInsert);

    const { data: examResult, error: examError } = await supabase
      .from('exams')
      .insert(examToInsert)
      .select('id')
      .single();

    if (examError) {
      console.error('Error creating exam:', examError);
      throw new Error(`Failed to create exam: ${examError.message}`);
    }

    const examId = examResult.id;
    console.log('Created exam with ID:', examId);

    // Create questions
    const questionsToInsert = examData.questions.map((question, index) => ({
      exam_id: examId,
      question_text: question.question,
      question_type: question.type === 'single-choice' ? 'multiple_choice' : question.type.replace('-', '_'),
      options: question.options ? JSON.stringify(question.options) : null,
      correct_answer: Array.isArray(question.correctAnswer) 
        ? JSON.stringify(question.correctAnswer) 
        : question.correctAnswer,
      marks: question.points,
      order_number: index + 1
    }));

    console.log('Inserting questions:', questionsToInsert);

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      // Try to clean up the exam if questions failed
      await supabase.from('exams').delete().eq('id', examId);
      throw new Error(`Failed to create questions: ${questionsError.message}`);
    }

    console.log('Successfully created exam and questions');
    return { examId, subjectId };

  } catch (error) {
    console.error('Error in createExamInDatabase:', error);
    throw error;
  }
};
