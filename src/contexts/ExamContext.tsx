
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

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  totalPoints: number;
  isActive: boolean;
  allowReview: boolean;
  shuffleQuestions: boolean;
  createdBy: string;
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
}

interface ExamContextType {
  exams: Exam[];
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  createExam: (exam: Omit<Exam, 'id'>) => void;
  startExam: (examId: string, studentId: string) => ExamAttempt | null;
  submitAnswer: (questionId: string, answer: string | string[]) => void;
  submitExam: () => void;
  getExamResults: (examId: string) => ExamAttempt[];
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
      title: 'Web Development Fundamentals',
      description: 'Test your knowledge of HTML, CSS, and JavaScript basics',
      duration: 60,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      totalPoints: 100,
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: '2',
      questions: [
        {
          id: 'q1',
          type: 'single-choice',
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlink and Text Markup Language'
          ],
          correctAnswer: 'Hyper Text Markup Language',
          points: 10,
          category: 'HTML',
          difficulty: 'easy',
          explanation: 'HTML stands for HyperText Markup Language, which is the standard markup language for creating web pages.'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'Which of the following are JavaScript data types?',
          options: ['String', 'Number', 'Boolean', 'Character'],
          correctAnswer: ['String', 'Number', 'Boolean'],
          points: 15,
          category: 'JavaScript',
          difficulty: 'medium'
        },
        {
          id: 'q3',
          type: 'fill-blank',
          question: 'CSS stands for _______ Style Sheets.',
          correctAnswer: 'Cascading',
          points: 10,
          category: 'CSS',
          difficulty: 'easy'
        }
      ]
    }
  ]);

  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);

  const createExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`
    };
    setExams(prev => [...prev, newExam]);
  };

  const startExam = (examId: string, studentId: string): ExamAttempt | null => {
    const exam = exams.find(e => e.id === examId);
    if (!exam || !exam.isActive) return null;

    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      examId,
      studentId,
      answers: {},
      startTime: new Date(),
      isCompleted: false,
      timeSpent: 0
    };

    setCurrentExam(exam);
    setCurrentAttempt(attempt);
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

    setCurrentAttempt(prev => prev ? {
      ...prev,
      endTime: new Date(),
      score,
      isCompleted: true,
      timeSpent: Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000)
    } : null);
  };

  const getExamResults = (examId: string): ExamAttempt[] => {
    // In a real app, this would fetch from a database
    return [];
  };

  return (
    <ExamContext.Provider value={{
      exams,
      currentExam,
      currentAttempt,
      createExam,
      startExam,
      submitAnswer,
      submitExam,
      getExamResults
    }}>
      {children}
    </ExamContext.Provider>
  );
};
