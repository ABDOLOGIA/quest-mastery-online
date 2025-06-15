
import { supabase } from '../../lib/supabase';
import { Exam } from '../../types/exam';
import { validateExamData } from './examValidation';
import { getOrCreateSubject } from './subjectCreation';
import { createQuestionsWithErrorHandling } from './questionCreation';
import { handleCreationError } from '../roleHelpers';

export const createExamInDatabase = async (examData: Omit<Exam, 'id'>, user: any): Promise<void> => {
  console.log('Creating exam with data:', examData);
  console.log('User creating exam:', { id: user.id, role: user.role });

  // Verify user is a teacher
  if (user.role !== 'teacher') {
    throw new Error('Teacher account required to create exams');
  }

  // Validate exam data
  const validationErrors = validateExamData(examData);
  if (Object.keys(validationErrors).length > 0) {
    const errorMessage = Object.values(validationErrors).join('; ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }

  let subjectId: string;
  
  try {
    subjectId = await getOrCreateSubject(examData.subject);
  } catch (error) {
    console.error('Subject creation/retrieval failed:', error);
    const errorMessage = handleCreationError(error);
    throw new Error(`Subject creation failed: ${errorMessage}`);
  }

  // Prepare exam data for insertion
  const examToInsert = {
    title: examData.title.trim(),
    description: examData.description?.trim() || '',
    subject_id: subjectId,
    teacher_id: user.id,
    creator_id: user.id, // Ensure creator_id is set
    duration_minutes: examData.duration,
    total_marks: examData.totalPoints,
    total_points: examData.totalPoints, // Set both for compatibility
    start_time: examData.alwaysAvailable ? null : examData.startTime.toISOString(),
    end_time: examData.alwaysAvailable ? null : examData.endTime.toISOString(),
    is_published: examData.isActive,
    status: examData.isActive ? 'published' : 'draft'
  };

  console.log('Inserting exam:', examToInsert);

  try {
    const { data: examResult, error: examError } = await supabase
      .from('exams')
      .insert(examToInsert)
      .select()
      .single();

    if (examError) {
      console.error('Error creating exam:', examError);
      const errorMessage = handleCreationError(examError);
      throw new Error(`Failed to create exam: ${errorMessage}`);
    }

    if (!examResult) {
      throw new Error('Exam creation failed - no data returned');
    }

    console.log('Exam created successfully:', examResult);

    // Create questions if any
    if (examData.questions && examData.questions.length > 0) {
      await createQuestionsWithErrorHandling(examResult.id, examData.questions);
    }

    console.log('Exam creation completed successfully');
  } catch (error) {
    console.error('Error in exam creation process:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred during exam creation. Please try again.');
    }
  }
};
