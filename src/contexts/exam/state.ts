
import { useState } from 'react';
import { Exam, ExamAttempt, StudentExam, DashboardStats } from '../../types/exam';

export const useExamState = () => {
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

  return {
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
  };
};
