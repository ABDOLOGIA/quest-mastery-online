
import { User } from '../types/auth';

export function canCreateContent(user: User | null): boolean {
  return user ? user.role === 'teacher' : false;
}

export function canManageExams(user: User | null): boolean {
  return user ? user.role === 'teacher' : false;
}

export function canUpdateExams(user: User | null): boolean {
  return user ? user.role === 'teacher' : false;
}

export function canDeleteExams(user: User | null): boolean {
  return user ? user.role === 'teacher' : false;
}

export function canViewAllExams(user: User | null): boolean {
  return user ? user.role === 'admin' : false;
}

export function canManageUsers(user: User | null): boolean {
  return user ? user.role === 'admin' : false;
}

export function canApproveRoleRequests(user: User | null): boolean {
  return user ? user.role === 'admin' : false;
}

export function canViewRoleRequests(user: User | null): boolean {
  return user ? user.role === 'admin' : false;
}

export function canRequestRoleUpgrade(user: User | null): boolean {
  return user ? ['student', 'teacher'].includes(user.role) : false;
}

export function isHigherRole(userRole: string, targetRole: string): boolean {
  const hierarchy = { 'student': 0, 'teacher': 1, 'admin': 2 };
  return hierarchy[userRole as keyof typeof hierarchy] > hierarchy[targetRole as keyof typeof hierarchy];
}

export function canManageRole(userRole: string, targetRole: string): boolean {
  return userRole === 'admin' || isHigherRole(userRole, targetRole);
}

export function hasTeacherPermissions(user: User | null): boolean {
  return user ? user.role === 'teacher' : false;
}

export function verifyCreatePermissions(user: User | null): void {
  if (!hasTeacherPermissions(user)) {
    throw new Error('Teacher account required to create content.');
  }
}

export function handleCreationError(error: any): string {
  if (!error) return 'An unknown error occurred';
  
  switch (error.code) {
    case '42501':
    case 'PGRST116':
      return 'Teacher account required. Please ensure you have teacher privileges.';
    case '23505':
      return 'This name already exists. Please choose a different name.';
    case '23502':
      return 'Required fields are missing. Please fill in all required information.';
    case '22P02':
      return 'Invalid data format. Please check your input and try again.';
    default:
      return error.message || 'Creation failed. Please try again or contact support if the problem persists.';
  }
}
