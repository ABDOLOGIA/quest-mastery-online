
import { supabase } from '../../lib/supabase';
import { handleCreationError } from '../roleHelpers';

interface SubjectCreationError extends Error {
  code?: string;
  details?: string;
}

export const createSubjectWithErrorHandling = async (subjectName: string): Promise<string> => {
  console.log('Creating subject with name:', subjectName);
  
  try {
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert({ 
        name: subjectName.trim(),
        description: `Subject for ${subjectName.trim()}`,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select('id')
      .single();

    if (error) {
      console.log('Subject creation error:', { error, code: error.code, details: error.details });
      const errorMessage = handleCreationError(error);
      throw new Error(errorMessage);
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

export const getOrCreateSubject = async (subjectName: string): Promise<string> => {
  try {
    // Check for existing subject first
    console.log('Checking for existing subject:', subjectName.trim());
    const { data: existingSubject, error: subjectQueryError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', subjectName.trim())
      .maybeSingle();

    if (subjectQueryError) {
      console.error('Error querying subject:', subjectQueryError);
      const errorMessage = handleCreationError(subjectQueryError);
      throw new Error(`Failed to check existing subjects: ${errorMessage}`);
    }

    if (existingSubject) {
      console.log('Using existing subject:', existingSubject.id);
      return existingSubject.id;
    } else {
      console.log('Subject not found, creating new subject:', subjectName);
      return await createSubjectWithErrorHandling(subjectName);
    }
  } catch (error) {
    console.error('Subject creation/retrieval failed:', error);
    throw error;
  }
};
