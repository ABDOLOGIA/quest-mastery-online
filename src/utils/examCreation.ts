
import { supabase } from '../lib/supabase';
import { Exam } from '../types/exam';

interface SubjectCreationError extends Error {
  code?: string;
  details?: string;
}

const createSubjectWithErrorHandling = async (subjectName: string): Promise<string> => {
  console.log('Creating subject with name:', subjectName);
  
  try {
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({ 
        name: subjectName.trim(),
        description: `Subject for ${subjectName.trim()}` 
      })
      .select('id')
      .single();

    if (error) {
      console.log('Subject creation error:', { error, code: error.code, details: error.details });
      
      // Handle specific error codes
      if (error.code === '23505') {
        throw new Error('Subject name already exists. Please choose a different name.');
      } else if (error.code === '42501') {
        throw new Error('You do not have permission to create subjects. Please contact an administrator.');
      } else if (error.code === '22P02') {
        throw new Error('Invalid subject data format. Please check your input.');
      } else if (error.code === '23502') {
        throw new Error('Subject name is required and cannot be empty.');
      } else {
        throw new Error(`Failed to create subject: ${error.message || 'Unknown error occurred'}`);
      }
    }

    if (!newSubject?.id) {
      throw new Error('Subject was created but ID was not returned. Please try again.');
    }

    console.log('Subject created successfully with ID:', newSubject.id);
    return newSubject.id;
  } catch (error) {
    console.error('Error in createSubjectWithErrorHandling:', error);
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unexpected error occurred while creating the subject.');
    }
  }
};

const validateExamData = (examData: Omit<Exam, 'id'>) => {
  const errors: Record<string, string> = {};

  if (!examData.title?.trim()) {
    errors.title = 'Exam title is required';
  }

  if (!examData.subject?.trim()) {
    errors.subject = 'Subject is required';
  }

  if (!examData.duration || examData.duration <= 0) {
    errors.duration = 'Duration must be greater than 0 minutes';
  }

  if (!examData.totalPoints || examData.totalPoints <= 0) {
    errors.totalPoints = 'Total points must be greater than 0';
  }

  if (!examData.alwaysAvailable) {
    if (!examData.startTime) {
      errors.startTime = 'Start time is required when not always available';
    }
    if (!examData.endTime) {
      errors.endTime = 'End time is required when not always available';
    }
    if (examData.startTime && examData.endTime && examData.startTime >= examData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
  }

  if (examData.questions && examData.questions.length === 0) {
    errors.questions = 'At least one question is required';
  }

  return errors;
};

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
    // Check for existing subject first
    console.log('Checking for existing subject:', examData.subject.trim());
    const { data: existingSubject, error: subjectQueryError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', examData.subject.trim())
      .maybeSingle();

    if (subjectQueryError) {
      console.error('Error querying subject:', subjectQueryError);
      throw new Error('Failed to check existing subjects. Please try again.');
    }

    if (existingSubject) {
      subjectId = existingSubject.id;
      console.log('Using existing subject:', subjectId);
    } else {
      console.log('Subject not found, creating new subject:', examData.subject);
      subjectId = await createSubjectWithErrorHandling(examData.subject);
    }
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

const createQuestionsWithErrorHandling = async (examId: string, questions: any[]) => {
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
