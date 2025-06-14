
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  Exam, 
  ExamAttempt, 
  StudentExam, 
  DashboardStats, 
  Warning 
} from '../types/exam';
import { 
  loadExamsFromDatabase,
  loadAttemptsFromDatabase,
  loadStudentExamsFromDatabase,
  getAllStudentsFromDatabase,
  submitExamToDatabase
} from '../utils/examOperations';
import {
  loadDashboardStatsFromDatabase,
  loadAllStudentsFromDatabase
} from '../utils/dashboardStats';
import { createExamInDatabase } from '../utils/examCreation';
import { supabase } from '../lib/supabase';

interface ExamContextType {
  exams: Exam[];
  attempts: ExamAttempt[];
  studentExams: StudentExam[];
  submittedExams: string[];
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  dashboardStats: DashboardStats;
  allStudents: any[];
  createExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  startExam: (examId: string, studentId: string) => ExamAttempt | null;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  submitExam: () => Promise<void>;
  addWarning: (attemptId: string, warning: Warning) => void;
  getExamResults: (examId: string) => ExamAttempt[];
  hasSubmittedExam: (examId: string, studentId: string) => boolean;
  setCurrentExam: (exam: Exam | null) => void;
  setCurrentAttempt: (attempt: ExamAttempt | null) => void;
  loadExams: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  loadAllStudents: () => Promise<void>;
  isLoading: boolean;
  getAllStudents: () => Promise<any[]>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const user = auth?.user;
  const { toast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [studentExams, setStudentExams] = useState<StudentExam[]>([]);
  const [submittedExams, setSubmittedExams] = useState<string[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    studentsCount: 0,
    activeExamsCount: 0,
    pendingGradingCount: 0
  });
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadExams();
      loadAttempts();
      loadStudentExams();
      loadDashboardStats();
      loadAllStudents();
    }
  }, [user]);

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
  }, [user]);

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

  const createExam = async (examData: Omit<Exam, 'id'>) => {
    try {
      setIsLoading(true);
      await createExamInDatabase(examData, user);
      
      toast({
        title: "Success",
        description: "Exam created successfully and is now available to students!",
      });

      // Immediately reload exams and stats
      await Promise.all([
        loadExams(),
        loadDashboardStats()
      ]);
      
      console.log('Exam creation completed successfully');
    } catch (error) {
      console.error('Error in createExam:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create exam. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const hasSubmittedExam = (examId: string, studentId: string): boolean => {
    return attempts.some(attempt => 
      attempt.examId === examId && 
      attempt.studentId === studentId && 
      attempt.isCompleted
    );
  };

  const startExam = (examId: string, studentId: string): ExamAttempt | null => {
    const exam = exams.find(e => e.id === examId);
    if (!exam || !exam.isActive) return null;

    if (hasSubmittedExam(examId, studentId)) {
      alert('You have already submitted this exam and cannot retake it.');
      return null;
    }

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId,
      studentId,
      answers: {},
      startTime: new Date(),
      isCompleted: false,
      timeSpent: 0,
      warnings: []
    };

    setCurrentExam(exam);
    setCurrentAttempt(attempt);
    setAttempts(prev => [...prev, attempt]);
    return attempt;
  };

  const submitAnswer = (questionId: string, answer: string | string[]) => {
    if (!currentAttempt) return;

    setCurrentAttempt(prev => prev ? {
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      }
    } : null);

    setAttempts(prev => prev.map(attempt => 
      attempt.id === currentAttempt.id 
        ? { ...attempt, answers: { ...attempt.answers, [questionId]: answer } }
        : attempt
    ));
  };

  const addWarning = (attemptId: string, warning: Warning) => {
    setAttempts(prev => prev.map(attempt => 
      attempt.id === attemptId 
        ? { ...attempt, warnings: [...attempt.warnings, warning] }
        : attempt
    ));
  };

  const submitExam = async () => {
    if (!currentAttempt || !currentExam || !user) return;

    try {
      const { score, timeSpent } = await submitExamToDatabase(currentAttempt, currentExam, user);

      const updatedAttempt = {
        ...currentAttempt,
        endTime: new Date(),
        isCompleted: true,
        score,
        timeSpent
      };

      setCurrentAttempt(updatedAttempt);
      setAttempts(prev => prev.map(attempt => 
        attempt.id === currentAttempt.id ? updatedAttempt : attempt
      ));
      setSubmittedExams(prev => [...prev, currentExam.id]);
      
      toast({
        title: "Success",
        description: `Exam submitted successfully! Your score: ${score}/${currentExam.totalPoints}`,
      });

      // Reload data
      await loadAttempts();
      await loadStudentExams();
    } catch (error) {
      console.error('Error in submitExam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getExamResults = (examId: string): ExamAttempt[] => {
    return attempts.filter(attempt => attempt.examId === examId);
  };

  return (
    <ExamContext.Provider value={{
      exams,
      attempts,
      studentExams,
      submittedExams,
      currentExam,
      currentAttempt,
      dashboardStats,
      allStudents,
      createExam,
      startExam,
      submitAnswer,
      submitExam,
      addWarning,
      getExamResults,
      hasSubmittedExam,
      setCurrentExam,
      setCurrentAttempt,
      loadExams,
      loadDashboardStats,
      loadAllStudents,
      isLoading,
      getAllStudents
    }}>
      {children}
    </ExamContext.Provider>
  );
};
