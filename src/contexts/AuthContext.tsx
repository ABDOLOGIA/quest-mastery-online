
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
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id, error);
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session, setting up user');
          await handleAuthUser(session);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        await handleAuthUser(session);
      } else {
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthUser = async (session: Session) => {
    try {
      setSession(session);
      
      // Check if email is confirmed
      const emailConfirmed = session.user.email_confirmed_at !== null;
      console.log('Email confirmed:', emailConfirmed, 'Email confirmed at:', session.user.email_confirmed_at);
      
      if (emailConfirmed) {
        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
        }

        if (profile) {
          console.log('Profile data fetched:', profile);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as UserRole,
            avatar: profile.avatar || undefined,
            department: profile.department || undefined,
            studentId: profile.student_id || undefined,
            emailConfirmed: true
          });
        } else {
          // Create basic user info if no profile exists
          console.log('No profile found, creating basic user info');
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            role: (session.user.user_metadata?.role as UserRole) || 'student',
            department: session.user.user_metadata?.department,
            studentId: session.user.user_metadata?.studentId,
            emailConfirmed: true
          });
        }
      } else {
        // Set user with limited info if email not confirmed
        console.log('Email not confirmed, setting limited user info');
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          role: (session.user.user_metadata?.role as UserRole) || 'student',
          department: session.user.user_metadata?.department,
          studentId: session.user.user_metadata?.studentId,
          emailConfirmed: false
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error in handleAuthUser:', error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        
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
          return { 
            success: false, 
            error: 'Please check your email and click the confirmation link to complete your registration.',
            needsConfirmation: true 
          };
        }
        
        // Login successful - auth state change listener will handle the rest
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
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
        
        const needsConfirmation = !authData.user.email_confirmed_at;
        console.log('Needs email confirmation:', needsConfirmation);
        
        return { 
          success: true, 
          needsConfirmation: needsConfirmation
        };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const resendConfirmation = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Resending confirmation email to:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
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
