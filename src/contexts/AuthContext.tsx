
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  studentId?: string;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  resendConfirmation: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      setSession(session);
      
      if (session?.user) {
        // Check if email is confirmed
        const emailConfirmed = session.user.email_confirmed_at !== null;
        console.log('Email confirmed:', emailConfirmed);
        
        if (emailConfirmed) {
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          // Set user with limited info if email not confirmed
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            role: 'student',
            emailConfirmed: false
          });
          setIsLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id, error);
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }
        
        // The auth state change listener will handle the session
        if (!session) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        console.log('Profile data fetched:', data);
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role as UserRole,
          avatar: data.avatar || undefined,
          department: data.department || undefined,
          studentId: data.student_id || undefined,
          emailConfirmed: true
        });
      } else {
        console.log('No profile found, user might need to complete registration');
        // Set basic user info even if no profile exists
        const session = await supabase.auth.getSession();
        if (session.data.session?.user) {
          setUser({
            id: session.data.session.user.id,
            email: session.data.session.user.email || '',
            name: session.data.session.user.user_metadata?.name || session.data.session.user.email?.split('@')[0] || '',
            role: 'student',
            emailConfirmed: true
          });
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        
        // Handle specific error cases
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
            error: 'Invalid email or password. Please check your credentials and try again.' 
          };
        }
        
        return { success: false, error: error.message };
      }

      if (data?.user) {
        console.log('Login successful for user:', data.user.id);
        
        // Check if email is confirmed
        if (!data.user.email_confirmed_at) {
          console.log('User email not confirmed yet');
          await supabase.auth.signOut(); // Sign out if email not confirmed
          setIsLoading(false);
          return { 
            success: false, 
            error: 'Please check your email and click the confirmation link to complete your registration.',
            needsConfirmation: true 
          };
        }
        
        // Auth state change listener will handle setting user and session
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    setIsLoading(true);
    
    try {
      console.log('Attempting registration for:', userData.email);
      
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
        setIsLoading(false);
        
        // Handle specific error cases
        if (authError.message.includes('User already registered') || authError.message.includes('already been registered')) {
          return { 
            success: false, 
            error: 'An account with this email already exists. Please try logging in instead.' 
          };
        }
        
        return { success: false, error: authError.message };
      }

      if (authData?.user) {
        console.log('Registration successful for user:', authData.user.id);
        
        setIsLoading(false);
        return { 
          success: true, 
          needsConfirmation: !authData.user.email_confirmed_at 
        };
      }

      setIsLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      setIsLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend confirmation error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, register, resendConfirmation, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
