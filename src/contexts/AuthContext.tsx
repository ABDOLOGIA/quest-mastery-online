
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { User, AuthContextType } from '../types/auth';
import { useAuthOperations } from '../hooks/useAuthOperations';
import { useProfileOperations } from '../hooks/useProfileOperations';
import { handleAuthUser } from '../utils/authHelpers';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface ExtendedAuthContextType extends AuthContextType {
  getUserProfile: (userId: string) => Promise<User | null>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  getAllProfiles: () => Promise<User[]>;
  getProfilesByRole: (role: string) => Promise<User[]>;
}

const ExtendedAuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const useExtendedAuth = () => {
  const context = useContext(ExtendedAuthContext);
  if (context === undefined) {
    throw new Error('useExtendedAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const authOperations = useAuthOperations();
  const profileOperations = useProfileOperations();

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
        await handleUserSession(session);
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
          await handleUserSession(session);
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
  }, []);

  const handleUserSession = async (session: Session) => {
    try {
      setSession(session);
      const userData = await handleAuthUser(session);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleUserSession:', error);
      setIsLoading(false);
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
    getProfilesByRole: profileOperations.getProfilesByRole
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
