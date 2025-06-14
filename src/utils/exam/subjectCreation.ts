
import { supabase } from '../../lib/supabase';

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
      throw new Error('Failed to check existing subjects. Please try again.');
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
