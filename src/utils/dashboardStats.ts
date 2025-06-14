
import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types/exam';

export const loadDashboardStatsFromDatabase = async (user: any): Promise<DashboardStats> => {
  if (!user) {
    return {
      studentsCount: 0,
      activeExamsCount: 0,
      pendingGradingCount: 0
    };
  }

  try {
    if (user.role === 'teacher') {
      // Load teacher-specific stats with better error handling
      const [studentsResult, activeExamsResult, pendingGradingResult] = await Promise.allSettled([
        supabase.rpc('get_teacher_students_count'),
        supabase.rpc('get_teacher_active_exams_count', { teacher_id_param: user.id }),
        supabase.rpc('get_teacher_pending_grading_new', { teacher_id_param: user.id })
      ]);

      const studentsCount = studentsResult.status === 'fulfilled' ? studentsResult.value.data || 0 : 0;
      const activeExamsCount = activeExamsResult.status === 'fulfilled' ? activeExamsResult.value.data || 0 : 0;
      const pendingGradingCount = pendingGradingResult.status === 'fulfilled' ? pendingGradingResult.value.data || 0 : 0;

      return {
        studentsCount,
        activeExamsCount,
        pendingGradingCount
      };
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }

  return {
    studentsCount: 0,
    activeExamsCount: 0,
    pendingGradingCount: 0
  };
};

export const loadAllStudentsFromDatabase = async (user: any): Promise<any[]> => {
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading students:', error);
      return [];
    }

    console.log('Loaded students:', data);
    return data || [];
  } catch (error) {
    console.error('Error in loadAllStudentsFromDatabase:', error);
    return [];
  }
};
