
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import { supabase } from '../lib/supabase';
import { canManageExams } from '../utils/roleHelpers';
import { getAllStudentsFromDatabase } from '../utils/exam/studentLoader';

interface TeacherStats {
  studentCount: number;
  pendingGrading: number;
  myExamsCount: number;
  activeExamsCount: number;
}

export const useTeacherStats = () => {
  const { user } = useAuth();
  const { exams } = useExam();
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
      console.log('Loading all students...');
      const students = await getAllStudentsFromDatabase();
      console.log('Students loaded:', students.length);
      
      setAllStudents(students);
      setStats(prev => ({
        ...prev,
        studentCount: students.length
      }));
    } catch (error) {
      console.error('Error loading students:', error);
      setAllStudents([]);
      setStats(prev => ({
        ...prev,
        studentCount: 0
      }));
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
