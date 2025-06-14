
import { useState, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../types/auth';
import { useProfileOperations } from './useProfileOperations';
import { handleAuthUser } from '../utils/authHelpers';

export const useSessionHandler = () => {
  const profileOperations = useProfileOperations();

  const handleUserSession = useCallback(async (
    session: Session,
    setUser: (user: User | null) => void,
    setSession: (session: Session | null) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    try {
      setSession(session);
      console.log('Handling user session for:', session.user.id);
      
      // First try to get the user data using our helper
      const userData = await handleAuthUser(session);
      
      if (userData) {
        console.log('User data from helper:', userData);
        setUser(userData);
      } else {
        console.log('No user data from helper, trying direct profile fetch');
        // Fallback: try to fetch profile directly
        const profile = await profileOperations.getUserProfile(session.user.id);
        if (profile) {
          console.log('Profile fetched directly:', profile);
          setUser(profile);
        } else {
          console.log('No profile found, creating basic user object');
          // Create a basic user object from session data
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: 'student',
            emailConfirmed: session.user.email_confirmed_at !== null
          };
          setUser(basicUser);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleUserSession:', error);
      setIsLoading(false);
    }
  }, [profileOperations]);

  return { handleUserSession };
};
