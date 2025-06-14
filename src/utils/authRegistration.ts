
import { supabase } from '../lib/supabase';
import type { User, AuthResult } from '../types/auth';
import { checkEmailExists } from './emailValidation';
import { checkStudentIdExists } from './studentIdValidation';

export const register = async (userData: Partial<User> & { password: string }): Promise<AuthResult> => {
  try {
    console.log('Attempting registration for:', userData.email);
    
    const emailCheck = await checkEmailExists(userData.email!);
    if (emailCheck.error) {
      return { success: false, error: emailCheck.error };
    }
    
    if (emailCheck.exists) {
      return { 
        success: false, 
        error: 'An account with this email address already exists. Please try logging in instead.' 
      };
    }

    // Check if student ID already exists (for students)
    if (userData.role === 'student' && userData.studentId) {
      console.log('Checking if student ID already exists:', userData.studentId);
      const studentIdCheck = await checkStudentIdExists(userData.studentId);
      if (studentIdCheck.exists) {
        return { 
          success: false, 
          error: 'This student ID is already registered. Please use a different student ID or try logging in.' 
        };
      }
    }
    
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('Creating user with metadata:', {
      name: userData.name,
      role: userData.role || 'student',
      department: userData.department || null,
      studentId: userData.studentId || null
    });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: userData.name,
          role: userData.role || 'student',
          department: userData.department || null,
          studentId: userData.studentId || null
        }
      }
    });

    if (authError) {
      console.error('Registration error:', authError);
      
      if (authError.message.includes('User already registered') || authError.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'An account with this email address already exists. Please try logging in instead.' 
        };
      }
      
      return { success: false, error: authError.message };
    }

    if (authData?.user) {
      console.log('Registration successful for user:', authData.user.id);
      console.log('Email confirmed at signup:', !!authData.user.email_confirmed_at);
      
      return { 
        success: true, 
        needsConfirmation: true
      };
    }

    return { success: false, error: 'Registration failed' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
