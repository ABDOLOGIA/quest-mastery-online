
import React, { createContext, useContext } from 'react';
import type { User, AuthContextType, UserRole } from '../types/auth';

interface ExtendedAuthContextType extends AuthContextType {
  getUserProfile: (userId: string) => Promise<User | null>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  getAllProfiles: () => Promise<User[]>;
  getProfilesByRole: (role: UserRole) => Promise<User[]>;
  refreshUserProfile: () => Promise<void>;
}

const ExtendedAuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const useExtendedAuth = () => {
  const context = useContext(ExtendedAuthContext);
  if (context === undefined) {
    throw new Error('useExtendedAuth must be used within an AuthProvider');
  }
  return context;
};

export { ExtendedAuthContext };
export type { ExtendedAuthContextType };
