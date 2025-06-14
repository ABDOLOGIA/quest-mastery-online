
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
