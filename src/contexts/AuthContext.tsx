
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('examSystem_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call - replace with real authentication
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo users for testing
    const demoUsers: Record<string, User & { password: string }> = {
      'admin@exam.com': {
        id: '1',
        email: 'admin@exam.com',
        name: 'System Administrator',
        role: 'admin',
        password: 'admin123'
      },
      'teacher@exam.com': {
        id: '2',
        email: 'teacher@exam.com',
        name: 'Dr. Sarah Johnson',
        role: 'teacher',
        department: 'Computer Science',
        password: 'teacher123'
      },
      'student@exam.com': {
        id: '3',
        email: 'student@exam.com',
        name: 'John Smith',
        role: 'student',
        studentId: 'CS2024001',
        password: 'student123'
      }
    };

    const foundUser = demoUsers[email];
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('examSystem_user', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: userData.email!,
      name: userData.name!,
      role: userData.role || 'student',
      department: userData.department,
      studentId: userData.studentId
    };

    setUser(newUser);
    localStorage.setItem('examSystem_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('examSystem_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
