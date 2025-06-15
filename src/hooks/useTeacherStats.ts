
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { supabase } from '../lib/supabase';
import { canManageExams } from '../utils/roleHelpers';

interface TeacherStats {
  studentCount: number;
  pendingGrading: number;
  myExamsCount: number;
  activeExamsCount: number;
}

export const useTeacherStats = () => {
  const { user } = useAuth();
  const { exams, getAllStudents } = useExam();
  const [stats, setStats] = useState<TeacherStats>({
    studentCount: 0,
    pendingGrading: 0,
    myExamsCount: 0,
    activeExamsCount: 0
  });
  const [allStudents, setAllStudents] = useState<any[]>([]);

  const myExams = exams.filter(exam => exam.createdBy === user?.id);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      myExamsCount: myExams.length,
      activeExamsCount: myExams.filter(e => e.isActive).length
    }));
  }, [myExams]);

  const loadAllStudents = async () => {
    try {
      const students = await getAllStudents();
      setAllStudents(students);
      setStats(prev => ({
        ...prev,
        studentCount: students.length
      }));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadTeacherStats = async () => {
    if (!user || !canManageExams(user)) return;

    try {
      const { data: pendingGradingData, error: gradingError } = await supabase
        .rpc('get_pending_grading_count', { teacher_id_param: user.id });

      if (gradingError) {
        console.error('Error fetching pending grading count:', gradingError);
      }

      setStats(prev => ({
        ...prev,
        pendingGrading: pendingGradingData || 0
      }));
    } catch (error) {
      console.error('Error loading teacher stats:', error);
    }
  };

  return {
    stats,
    allStudents,
    myExams,
    loadAllStudents,
    loadTeacherStats
  };
};
