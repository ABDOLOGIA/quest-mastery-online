
import { supabase } from '../lib/supabase';
import type { AuthResult } from '../types/auth';

export const resendConfirmation = async (email: string): Promise<AuthResult> => {
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

export const logout = async () => {
  console.log('Logging out user');
  await supabase.auth.signOut();
};
