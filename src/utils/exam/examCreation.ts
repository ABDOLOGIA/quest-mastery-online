
import { supabase } from '../../lib/supabase';
import { Exam } from '../../types/exam';
import { validateExamData } from './examValidation';
import { getOrCreateSubject } from './subjectCreation';
import { createQuestionsWithErrorHandling } from './questionCreation';

export const createExamInDatabase = async (examData: Omit<Exam, 'id'>, user: any): Promise<void> => {
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    const errorMsg = 'Unauthorized: Only teachers and admins can create exams';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log('Creating exam with data:', examData);

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
    throw error;
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

  try {
    const { data: examResult, error: examError } = await supabase
      .from('exams')
      .insert(examToInsert)
      .select()
      .single();

    if (examError) {
      console.error('Error creating exam:', examError);
      
      // Handle specific exam creation errors
      if (examError.code === '23505') {
        throw new Error('An exam with this title already exists. Please choose a different title.');
      } else if (examError.code === '42501') {
        throw new Error('You do not have permission to create exams. Please contact an administrator.');
      } else {
        throw new Error(`Failed to create exam: ${examError.message}`);
      }
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
    throw error;
  }
};
