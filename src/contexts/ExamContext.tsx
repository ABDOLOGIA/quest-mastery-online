
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ExamContextType } from './exam/types';
import { useExamState } from './exam/state';
import { useExamSubscriptions } from './exam/subscriptions';
import { useExamLoaders } from './exam/loaders';
import { useExamActions } from './exam/actions';

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

  // State management
  const {
    exams,
    setExams,
    attempts,
    setAttempts,
    studentExams,
    setStudentExams,
    submittedExams,
    setSubmittedExams,
    currentExam,
    setCurrentExam,
    currentAttempt,
    setCurrentAttempt,
    dashboardStats,
    setDashboardStats,
    allStudents,
    setAllStudents,
    isLoading,
    setIsLoading
  } = useExamState();

  // Data loaders
  const {
    loadDashboardStats,
    loadAllStudents,
    loadStudentExams,
    getAllStudents,
    loadExams,
    loadAttempts
  } = useExamLoaders(
    user,
    setExams,
    setAttempts,
    setStudentExams,
    setSubmittedExams,
    setDashboardStats,
    setAllStudents,
    setIsLoading
  );

  // Actions
  const {
    createExam,
    hasSubmittedExam,
    startExam,
    submitAnswer,
    addWarning,
    submitExam,
    getExamResults
  } = useExamActions(
    user,
    exams,
    attempts,
    currentAttempt,
    currentExam,
    setCurrentExam,
    setCurrentAttempt,
    setAttempts,
    setSubmittedExams,
    setIsLoading,
    loadExams,
    loadDashboardStats,
    loadAttempts,
    loadStudentExams
  );

  // Initial data loading
  useEffect(() => {
    if (user) {
      loadExams();
      loadAttempts();
      loadStudentExams();
      loadDashboardStats();
      loadAllStudents();
    }
  }, [user]);

  // Real-time subscriptions
  useExamSubscriptions(user, loadExams, loadStudentExams, loadDashboardStats, loadAllStudents);

  return (
    <ExamContext.Provider value={{
      exams,
      setExams,
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
