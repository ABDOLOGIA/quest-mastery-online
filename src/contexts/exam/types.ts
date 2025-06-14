
import { Exam, ExamAttempt, StudentExam, DashboardStats, Warning } from '../../types/exam';

export interface ExamContextType {
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
