
import { supabase } from '../lib/supabase';
import type { EmailCheckResult } from '../types/auth';

export const checkStudentIdExists = async (studentId: string): Promise<EmailCheckResult> => {
  try {
    console.log('Checking if student ID exists:', studentId);
    
    if (!studentId) {
      return { exists: false, error: 'Please enter a valid student ID' };
    }
    
    // First check profiles table with explicit logging
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('student_id, email, name, role')
      .eq('student_id', studentId);
    
    console.log('Profiles query result:', { profiles, profileError });
    
    if (profileError) {
      console.error('Error checking student ID in profiles:', profileError);
      return { exists: false, error: 'Database error while checking student ID' };
    }
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('Student ID found in profiles table:', profile);
      return { 
        exists: true, 
        email: profile.email 
      };
    }
    
    console.log('Student ID not found in profiles table');
    return { exists: false };
    
  } catch (error) {
    console.error('Error checking student ID existence:', error);
    return { exists: false, error: 'Unexpected error while checking student ID' };
  }
};
