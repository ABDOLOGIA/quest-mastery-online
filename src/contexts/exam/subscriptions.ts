
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const useExamSubscriptions = (
  user: any,
  loadExams: () => Promise<void>,
  loadStudentExams: () => Promise<void>,
  loadDashboardStats: () => Promise<void>,
  loadAllStudents: () => Promise<void>
) => {
  useEffect(() => {
    if (!user) return;

    // Subscribe to exam changes
    const examChannel = supabase
      .channel('exam-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exams'
        },
        (payload) => {
          console.log('Exam change detected:', payload);
          loadExams();
          loadDashboardStats();
        }
      )
      .subscribe();

    // Subscribe to student exam submissions
    const studentExamChannel = supabase
      .channel('student-exam-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_exams'
        },
        (payload) => {
          console.log('Student exam change detected:', payload);
          loadStudentExams();
          loadDashboardStats();
        }
      )
      .subscribe();

    // Subscribe to user/student changes for real-time student count updates
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.student'
        },
        (payload) => {
          console.log('Student profile change detected:', payload);
          loadAllStudents();
          loadDashboardStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(examChannel);
      supabase.removeChannel(studentExamChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user, loadExams, loadStudentExams, loadDashboardStats, loadAllStudents]);
};
