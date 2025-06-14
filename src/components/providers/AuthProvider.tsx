
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../../types/auth';
import { useAuthOperations } from '../../hooks/useAuthOperations';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import { useSessionHandler } from '../../hooks/useSessionHandler';
import { AuthContext } from '../../contexts/AuthContext';
import { ExtendedAuthContext, type ExtendedAuthContextType } from '../../contexts/ExtendedAuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authOperations = useAuthOperations();
  const profileOperations = useProfileOperations();
  const { handleUserSession } = useSessionHandler();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set loading timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('Auth loading timeout reached, stopping loading state');
      setIsLoading(false);
    }, 5000);
    
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      clearTimeout(loadingTimeout);
      
      if (session?.user) {
        await handleUserSession(session, setUser, setSession, setIsLoading);
      } else {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    // Check for existing session
    const getInitialSession = async () => {
      try {
        console.log('Checking for initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id, error);
        
        if (!mounted) return;
        
        clearTimeout(loadingTimeout);
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session, setting up user');
          await handleUserSession(session, setUser, setSession, setIsLoading);
        } else {
          console.log('No existing session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          clearTimeout(loadingTimeout);
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [handleUserSession]);

  const refreshUserProfile = async () => {
    if (session?.user) {
      console.log('Refreshing user profile for:', session.user.id);
      const profile = await profileOperations.getUserProfile(session.user.id);
      if (profile) {
        setUser(profile);
        console.log('User profile refreshed:', profile);
      }
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    setIsLoading(true);
    await authOperations.logout();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const extendedContextValue: ExtendedAuthContextType = {
    user, 
    session, 
    login: authOperations.login,
    logout, 
    register: authOperations.register, 
    resendConfirmation: authOperations.resendConfirmation, 
    checkEmailExists: authOperations.checkEmailExists, 
    isLoading,
    getUserProfile: profileOperations.getUserProfile,
    updateUserProfile: profileOperations.updateUserProfile,
    getAllProfiles: profileOperations.getAllProfiles,
    getProfilesByRole: profileOperations.getProfilesByRole,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        login: authOperations.login,
        logout, 
        register: authOperations.register, 
        resendConfirmation: authOperations.resendConfirmation, 
        checkEmailExists: authOperations.checkEmailExists, 
        isLoading 
      }}
    >
      <ExtendedAuthContext.Provider value={extendedContextValue}>
        {children}
      </ExtendedAuthContext.Provider>
    </AuthContext.Provider>
  );
};
