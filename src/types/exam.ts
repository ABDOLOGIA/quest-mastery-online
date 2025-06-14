
export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface Warning {
  type: string;
  message: string;
  timestamp: Date;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  questions: Question[];
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  totalPoints: number;
  isActive: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  createdBy: string;
  scheduledDate?: Date;
  alwaysAvailable?: boolean;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: Record<string, string | string[]>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  isCompleted: boolean;
  timeSpent: number;
  warnings: Warning[];
  isTerminated?: boolean;
}

export interface StudentExam {
  id: string;
  studentId: string;
  examId: string;
  startedAt: Date;
  submittedAt?: Date;
  answers: Record<string, string | string[]>;
  score?: number;
  isGraded: boolean;
  isSubmitted: boolean;
  timeSpent: number;
}

export interface DashboardStats {
  studentsCount: number;
  activeExamsCount: number;
  pendingGradingCount: number;
}
