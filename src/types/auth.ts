
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

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  checkEmailExists: (email: string) => Promise<EmailCheckResult>;
  isLoading: boolean;
}

export interface ExtendedAuthContextType extends AuthContextType {
  getUserProfile: (userId: string) => Promise<User | null>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  getAllProfiles: () => Promise<User[]>;
  getProfilesByRole: (role: UserRole) => Promise<User[]>;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  needsConfirmation?: boolean;
}

export interface EmailCheckResult {
  exists: boolean;
  error?: string;
  email?: string;
}
