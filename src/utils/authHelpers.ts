
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { User, UserRole } from '../types/auth';

export const handleAuthUser = async (session: Session): Promise<User | null> => {
  try {
    // Check if email is confirmed
    const emailConfirmed = session.user.email_confirmed_at !== null;
    console.log('Email confirmed:', emailConfirmed, 'Email confirmed at:', session.user.email_confirmed_at);
    
    if (emailConfirmed) {
      // Fetch user profile with proper error handling
      console.log('Fetching profile for authenticated user:', session.user.id);
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        console.log('Profile fetch result:', { profile, error });

        if (error) {
          console.error('Error fetching user profile:', error);
          // Continue with basic user info if profile fetch fails
        }

        if (profile) {
          console.log('Profile data fetched successfully:', profile);
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
          console.log('No profile found, checking if profile should be created');
          
          // Try to create profile if it doesn't exist
          const userMetadata = session.user.user_metadata || {};
          const profileData = {
            id: session.user.id,
            email: session.user.email,
            name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
            role: (userMetadata.role as UserRole) || 'student',
            department: userMetadata.department || null,
            student_id: userMetadata.studentId || null
          };

          console.log('Attempting to create profile:', profileData);

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .maybeSingle();

          if (createError) {
            console.error('Error creating profile:', createError);
            // Return basic user info even if profile creation fails
            return {
              id: session.user.id,
              email: session.user.email || '',
              name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
              role: (userMetadata.role as UserRole) || 'student',
              department: userMetadata.department || undefined,
              studentId: userMetadata.studentId || undefined,
              emailConfirmed: true
            };
          }

          if (newProfile) {
            console.log('Profile created successfully:', newProfile);
            return {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              role: newProfile.role as UserRole,
              avatar: newProfile.avatar || undefined,
              department: newProfile.department || undefined,
              studentId: newProfile.student_id || undefined,
              emailConfirmed: true
            };
          }

          // Fallback to basic user info
          return {
            id: session.user.id,
            email: session.user.email || '',
            name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
            role: (userMetadata.role as UserRole) || 'student',
            department: userMetadata.department || undefined,
            studentId: userMetadata.studentId || undefined,
            emailConfirmed: true
          };
        }
      } catch (profileError) {
        console.error('Profile operation failed:', profileError);
        // Return basic user info if all profile operations fail
        const userMetadata = session.user.user_metadata || {};
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
          role: (userMetadata.role as UserRole) || 'student',
          department: userMetadata.department || undefined,
          studentId: userMetadata.studentId || undefined,
          emailConfirmed: true
        };
      }
    } else {
      // Set user with limited info if email not confirmed
      console.log('Email not confirmed, setting limited user info');
      const userMetadata = session.user.user_metadata || {};
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: userMetadata.name || session.user.email?.split('@')[0] || 'User',
        role: (userMetadata.role as UserRole) || 'student',
        department: userMetadata.department || undefined,
        studentId: userMetadata.studentId || undefined,
        emailConfirmed: false
      };
    }
  } catch (error) {
    console.error('Error in handleAuthUser:', error);
    return null;
  }
};
