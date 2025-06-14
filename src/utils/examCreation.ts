
import { supabase } from '../lib/supabase';
import { Exam } from '../types/exam';

export const createExamInDatabase = async (examData: Omit<Exam, 'id'>, user: any): Promise<void> => {
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    const errorMsg = 'Unauthorized: Only teachers and admins can create exams';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('Creating exam with data:', examData);

  // Validate required fields
  if (!examData.title?.trim()) {
    throw new Error('Exam title is required');
  }
  if (!examData.subject?.trim()) {
    throw new Error('Subject is required');
  }
  if (examData.duration <= 0) {
    throw new Error('Duration must be greater than 0');
  }
  if (examData.totalPoints <= 0) {
    throw new Error('Total points must be greater than 0');
  }

  // First, get or create the subject
  let subjectId;
  
  // Check for existing subject
  const { data: existingSubject, error: subjectQueryError } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', examData.subject.trim())
    .maybeSingle();

  if (subjectQueryError) {
    console.error('Error querying subject:', subjectQueryError);
    throw new Error('Failed to check subject. Please try again.');
  }

  if (existingSubject) {
    subjectId = existingSubject.id;
    console.log('Using existing subject:', subjectId);
  } else {
    console.log('Creating new subject:', examData.subject);
    const { data: newSubject, error: subjectError } = await supabase
      .from('subjects')
      .insert({ 
        name: examData.subject.trim(),
        description: `Subject for ${examData.subject.trim()}` 
      })
      .select('id')
      .single();

    if (subjectError) {
      console.error('Error creating subject:', subjectError);
      throw new Error(`Failed to create subject: ${subjectError.message}`);
    }
    subjectId = newSubject.id;
    console.log('Created new subject:', subjectId);
  }

  // Prepare exam data for insertion
  const examToInsert = {
    title: examData.title.trim(),
    description: examData.description?.trim() || '',
    subject_id: subjectId,
    teacher_id: user.id,
    duration_minutes: examData.duration,
    total_marks: examData.totalPoints,
    start_time: examData.alwaysAvailable ? null : examData.startTime.toISOString(),
    end_time: examData.alwaysAvailable ? null : examData.endTime.toISOString(),
    is_published: examData.isActive
  };

  console.log('Inserting exam:', examToInsert);

  const { data: examResult, error: examError } = await supabase
    .from('exams')
    .insert(examToInsert)
    .select()
    .single();

  if (examError) {
    console.error('Error creating exam:', examError);
    throw new Error(`Failed to create exam: ${examError.message}`);
  }

  console.log('Exam created successfully:', examResult);

  // Create questions if any
  if (examData.questions && examData.questions.length > 0) {
    const questionsData = examData.questions.map((question, index) => ({
      exam_id: examResult.id,
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
      // Don't throw here, exam was created successfully
      throw new Error('Exam created but some questions could not be saved. You can add them later.');
    } else {
      console.log('Questions created successfully');
    }
  }

  console.log('Exam creation completed successfully');
};
