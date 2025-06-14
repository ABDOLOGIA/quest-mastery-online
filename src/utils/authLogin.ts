
import { supabase } from '../lib/supabase';
import type { AuthResult } from '../types/auth';
import { checkStudentIdExists } from './studentIdValidation';

export const login = async (emailOrStudentId: string, password: string): Promise<AuthResult> => {
  try {
    console.log('Attempting login for:', emailOrStudentId);
    
    let email = emailOrStudentId;
    
    // Check if input looks like a student ID (doesn't contain @)
    if (!emailOrStudentId.includes('@')) {
      console.log('Input appears to be a student ID, looking up email...');
      const studentIdCheck = await checkStudentIdExists(emailOrStudentId);
      
      console.log('Student ID check result:', studentIdCheck);
      
      if (studentIdCheck.error) {
        return { 
          success: false, 
          error: studentIdCheck.error 
        };
      }
      
      if (studentIdCheck.exists && studentIdCheck.email) {
        email = studentIdCheck.email;
        console.log('Found email for student ID:', email);
      } else {
        return { 
          success: false, 
          error: `Student ID "${emailOrStudentId}" not found. Please check your student ID and try again, or contact your administrator.` 
        };
      }
    }
    
    console.log('Attempting Supabase login with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please check your email and click the confirmation link before logging in.',
          needsConfirmation: true 
        };
      }
      
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid credentials. Please check your email/student ID and password.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    if (data?.user) {
      console.log('Login successful for user:', data.user.id);
      
      if (!data.user.email_confirmed_at) {
        console.log('User email not confirmed yet');
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'Please check your email and click the confirmation link to complete your registration.',
          needsConfirmation: true 
        };
      }
      
      return { success: true };
    }

    return { success: false, error: 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
