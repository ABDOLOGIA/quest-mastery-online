
import { supabase } from '../lib/supabase';
import type { User, UserRole, AuthResult, EmailCheckResult } from '../types/auth';

export const useAuthOperations = () => {
  const checkEmailExists = async (email: string): Promise<EmailCheckResult> => {
    try {
      console.log('Checking if email exists:', email);
      
      if (!email || !email.includes('@')) {
        return { exists: false, error: 'Please enter a valid email address' };
      }
      
      // Check if user exists in profiles table first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking email in profiles:', profileError);
        return { exists: false };
      }
      
      if (profile) {
        console.log('Email found in profiles table');
        return { exists: true };
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error checking email existence:', error);
      return { exists: false };
    }
  };

  const checkStudentIdExists = async (studentId: string): Promise<EmailCheckResult> => {
    try {
      console.log('Checking if student ID exists:', studentId);
      
      if (!studentId) {
        return { exists: false, error: 'Please enter a valid student ID' };
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('student_id, email')
        .eq('student_id', studentId)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error checking student ID in profiles:', profileError);
        return { exists: false };
      }
      
      if (profile) {
        console.log('Student ID found in profiles table');
        return { exists: true, email: profile.email };
      }
      
      return { exists: false };
      
    } catch (error) {
      console.error('Error checking student ID existence:', error);
      return { exists: false };
    }
  };

  const login = async (emailOrStudentId: string, password: string): Promise<AuthResult> => {
    try {
      console.log('Attempting login for:', emailOrStudentId);
      
      let email = emailOrStudentId;
      
      // Check if input looks like a student ID (doesn't contain @)
      if (!emailOrStudentId.includes('@')) {
        console.log('Input appears to be a student ID, looking up email...');
        const studentIdCheck = await checkStudentIdExists(emailOrStudentId);
        
        if (studentIdCheck.exists && studentIdCheck.email) {
          email = studentIdCheck.email;
          console.log('Found email for student ID:', email);
        } else {
          return { 
            success: false, 
            error: 'Student ID not found. Please check your student ID and try again.' 
          };
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        
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

  const register = async (userData: Partial<User> & { password: string }): Promise<AuthResult> => {
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
        const studentIdCheck = await checkStudentIdExists(userData.studentId);
        if (studentIdCheck.exists) {
          return { 
            success: false, 
            error: 'This student ID is already registered. Please use a different student ID or try logging in.' 
          };
        }
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
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

  const resendConfirmation = async (email: string): Promise<AuthResult> => {
    try {
      console.log('Resending confirmation email to:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return { success: false, error: error.message };
      }

      console.log('Confirmation email resent successfully');
      return { success: true };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
  };

  return {
    checkEmailExists,
    checkStudentIdExists,
    login,
    register,
    resendConfirmation,
    logout
  };
};
