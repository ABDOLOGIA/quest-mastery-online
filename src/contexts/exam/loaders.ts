
import { useToast } from '../../hooks/use-toast';
import {
  loadExamsFromDatabase,
  loadAttemptsFromDatabase,
  loadStudentExamsFromDatabase,
  getAllStudentsFromDatabase
} from '../../utils/examOperations';
import {
  loadDashboardStatsFromDatabase,
  loadAllStudentsFromDatabase
} from '../../utils/dashboardStats';

export const useExamLoaders = (
  user: any,
  setExams: (exams: any[]) => void,
  setAttempts: (attempts: any[]) => void,
  setStudentExams: (studentExams: any[]) => void,
  setSubmittedExams: (submittedExams: string[]) => void,
  setDashboardStats: (stats: any) => void,
  setAllStudents: (students: any[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { toast } = useToast();

  const loadDashboardStats = async () => {
    try {
      const stats = await loadDashboardStatsFromDatabase(user);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Warning",
        description: "Some dashboard statistics could not be loaded.",
        variant: "destructive",
      });
    }
  };

  const loadAllStudents = async () => {
    try {
      setIsLoading(true);
      const students = await loadAllStudentsFromDatabase(user);
      setAllStudents(students);
      
      // Update student count in stats
      setDashboardStats(prev => ({
        ...prev,
        studentsCount: students.length
      }));
    } catch (error) {
      console.error('Error in loadAllStudents:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading students.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentExams = async () => {
    try {
      const studentExamsData = await loadStudentExamsFromDatabase(user);
      setStudentExams(studentExamsData);
    } catch (error) {
      console.error('Error in loadStudentExams:', error);
    }
  };

  const getAllStudents = async () => {
    return await getAllStudentsFromDatabase();
  };

  const loadExams = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const examsData = await loadExamsFromDatabase(user);
      setExams(examsData);
    } catch (error) {
      console.error('Error in loadExams:', error);
      toast({
        title: "Error",
        description: "Failed to load exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttempts = async () => {
    try {
      const attemptsData = await loadAttemptsFromDatabase(user);
      setAttempts(attemptsData);
      setSubmittedExams(attemptsData.filter(a => a.isCompleted).map(a => a.examId));
    } catch (error) {
      console.error('Error in loadAttempts:', error);
    }
  };

  return {
    loadDashboardStats,
    loadAllStudents,
    loadStudentExams,
    getAllStudents,
    loadExams,
    loadAttempts
  };
};
