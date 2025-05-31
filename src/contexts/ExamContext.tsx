
import React, { createContext, useContext, useState } from 'react';

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

interface ExamContextType {
  exams: Exam[];
  attempts: ExamAttempt[];
  submittedExams: string[];
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  createExam: (exam: Omit<Exam, 'id'>) => void;
  startExam: (examId: string, studentId: string) => ExamAttempt | null;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  submitExam: () => void;
  addWarning: (attemptId: string, warning: Warning) => void;
  getExamResults: (examId: string) => ExamAttempt[];
  hasSubmittedExam: (examId: string, studentId: string) => boolean;
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
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 'exam-1',
      title: 'Mathematics - Algebra Basics',
      subject: 'Mathematics',
      description: 'Test your knowledge of basic algebra concepts',
      duration: 75,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalPoints: 100,
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: '2',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          question: 'What is the value of x if 2x + 5 = 13?',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 15,
          category: 'Algebra',
          difficulty: 'easy'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Which of the following are prime numbers?',
          options: ['2', '3', '4', '5', '6', '7'],
          correctAnswer: ['2', '3', '5', '7'],
          points: 20,
          category: 'Number Theory',
          difficulty: 'medium'
        },
        {
          id: 'q3',
          type: 'fill-blank',
          question: 'The square root of 64 is ____.',
          correctAnswer: '8',
          points: 10,
          category: 'Arithmetic',
          difficulty: 'easy'
        },
        {
          id: 'q4',
          type: 'short-answer',
          question: 'Explain the difference between a rational and irrational number.',
          points: 25,
          category: 'Number Theory',
          difficulty: 'medium'
        },
        {
          id: 'q5',
          type: 'single-choice',
          question: 'What is the slope of the line y = 3x + 2?',
          options: ['2', '3', '5', '1'],
          correctAnswer: '3',
          points: 15,
          category: 'Linear Equations',
          difficulty: 'medium'
        },
        {
          id: 'q6',
          type: 'single-choice',
          question: 'If f(x) = x² + 2x + 1, what is f(3)?',
          options: ['12', '14', '16', '18'],
          correctAnswer: '16',
          points: 15,
          category: 'Functions',
          difficulty: 'medium'
        }
      ]
    },
    {
      id: 'exam-2',
      title: 'Physics - Mechanics',
      subject: 'Physics',
      description: 'Test your understanding of basic mechanics principles',
      duration: 80,
      startTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      totalPoints: 120,
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: '2',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          question: "What is Newton's first law of motion?",
          options: [
            'Force equals mass times acceleration',
            'An object at rest stays at rest unless acted upon by a force',
            'For every action there is an equal and opposite reaction',
            'Energy cannot be created or destroyed'
          ],
          correctAnswer: 'An object at rest stays at rest unless acted upon by a force',
          points: 20,
          category: 'Laws of Motion',
          difficulty: 'easy'
        }
        // Add more physics questions...
      ]
    },
    {
      id: 'exam-3',
      title: 'Chinese HSK2 - Vocabulary & Grammar',
      subject: 'Chinese HSK2',
      description: 'HSK Level 2 Chinese proficiency test',
      duration: 90,
      startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      totalPoints: 100,
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: '2',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          question: '我_____学生。(I am a student.)',
          options: ['是', '有', '在', '做'],
          correctAnswer: '是',
          points: 10,
          category: 'Grammar',
          difficulty: 'easy'
        }
        // Add more Chinese questions...
      ]
    }
  ]);

  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [submittedExams, setSubmittedExams] = useState<string[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);

  const createExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`
    };
    setExams(prev => [...prev, newExam]);
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

    // Check if student already submitted this exam
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

    // Update attempts array
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

  const submitExam = () => {
    if (!currentAttempt || !currentExam) return;

    let score = 0;
    currentExam.questions.forEach(question => {
      const userAnswer = currentAttempt.answers[question.id];
      if (userAnswer && userAnswer === question.correctAnswer) {
        score += question.points;
      }
    });

    const updatedAttempt = {
      ...currentAttempt,
      endTime: new Date(),
      isCompleted: true,
      timeSpent: Math.floor((new Date().getTime() - currentAttempt.startTime.getTime()) / 1000)
    };

    setCurrentAttempt(updatedAttempt);
    setAttempts(prev => prev.map(attempt => 
      attempt.id === currentAttempt.id ? updatedAttempt : attempt
    ));
    setSubmittedExams(prev => [...prev, currentExam.id]);
  };

  const getExamResults = (examId: string): ExamAttempt[] => {
    return attempts.filter(attempt => attempt.examId === examId);
  };

  return (
    <ExamContext.Provider value={{
      exams,
      attempts,
      submittedExams,
      currentExam,
      currentAttempt,
      createExam,
      startExam,
      submitAnswer,
      submitExam,
      addWarning,
      getExamResults,
      hasSubmittedExam
    }}>
      {children}
    </ExamContext.Provider>
  );
};
