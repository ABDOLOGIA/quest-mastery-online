
import { supabase } from '../lib/supabase';
import type { EmailCheckResult } from '../types/auth';

export const checkStudentIdExists = async (studentId: string): Promise<EmailCheckResult> => {
  try {
    console.log('Checking if student ID exists:', studentId);
    
    if (!studentId) {
      return { exists: false, error: 'Please enter a valid student ID' };
    }
    
    // Use a more direct query to avoid RLS issues
    const { data: profiles, error: profileError } = await supabase
      .rpc('get_profile_by_student_id', { student_id_param: studentId });
    
    console.log('RPC query result:', { profiles, profileError });
    
    if (profileError) {
      console.error('Error checking student ID via RPC:', profileError);
      
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('student_id, email, name, role')
        .eq('student_id', studentId)
        .limit(1);
      
      console.log('Fallback query result:', { fallbackData, fallbackError });
      
      if (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return { exists: false, error: 'Database error while checking student ID. Please try again.' };
      }
      
      if (fallbackData && fallbackData.length > 0) {
        const profile = fallbackData[0];
        console.log('Student ID found via fallback:', profile);
        return { 
          exists: true, 
          email: profile.email 
        };
      }
      
      return { exists: false };
    }
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('Student ID found via RPC:', profile);
      return { 
        exists: true, 
        email: profile.email 
      };
    }
    
    console.log('Student ID not found');
    return { exists: false };
    
  } catch (error) {
    console.error('Error checking student ID existence:', error);
    return { exists: false, error: 'Unexpected error while checking student ID. Please try again.' };
  }
};
