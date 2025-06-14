
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '../types/auth';

export const handleAuthUser = async (session: Session): Promise<User | null> => {
  try {
    // Check if email is confirmed
    const emailConfirmed = session.user.email_confirmed_at !== null;
    console.log('Email confirmed:', emailConfirmed, 'Email confirmed at:', session.user.email_confirmed_at);
    
    if (emailConfirmed) {
      // Fetch user profile with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );

      try {
        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error);
        }

        if (profile) {
          console.log('Profile data fetched:', profile);
          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as UserRole,
            avatar: profile.avatar || undefined,
            department: profile.department || undefined,
            studentId: profile.student_id || undefined,
            emailConfirmed: true
          };
        } else {
          // Create basic user info if no profile exists
          console.log('No profile found, creating basic user info');
          return {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            role: (session.user.user_metadata?.role as UserRole) || 'student',
            department: session.user.user_metadata?.department,
            studentId: session.user.user_metadata?.studentId,
            emailConfirmed: true
          };
        }
      } catch (profileError) {
        console.error('Profile fetch failed:', profileError);
        // Still set basic user info even if profile fetch fails
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          role: (session.user.user_metadata?.role as UserRole) || 'student',
          department: session.user.user_metadata?.department,
          studentId: session.user.user_metadata?.studentId,
          emailConfirmed: true
        };
      }
    } else {
      // Set user with limited info if email not confirmed
      console.log('Email not confirmed, setting limited user info');
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
        role: (session.user.user_metadata?.role as UserRole) || 'student',
        department: session.user.user_metadata?.department,
        studentId: session.user.user_metadata?.studentId,
        emailConfirmed: false
      };
    }
  } catch (error) {
    console.error('Error in handleAuthUser:', error);
    return null;
  }
};
