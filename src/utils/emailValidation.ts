
import { supabase } from '../lib/supabase';
import type { EmailCheckResult } from '../types/auth';

export const checkEmailExists = async (email: string): Promise<EmailCheckResult> => {
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
