
import { User } from '../types/auth';

export function canCreateContent(user: User | null): boolean {
  return user ? ['admin', 'teacher'].includes(user.role) : false;
}

export function canManageExams(user: User | null): boolean {
  return user ? ['admin', 'teacher'].includes(user.role) : false;
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
