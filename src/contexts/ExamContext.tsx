import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

interface ExamContextType {
  exams: Exam[];
  attempts: ExamAttempt[];
  submittedExams: string[];
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
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
  isLoading: boolean;
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
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [submittedExams, setSubmittedExams] = useState<string[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<ExamAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadExams();
      loadAttempts();
    }
  }, [user]);

  const loadExams = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      let query = supabase.from('exams').select(`
        *,
        subjects!exams_subject_id_fkey(name),
        questions(*)
      `);

      // Students can only see published exams
      if (user.role === 'student') {
        query = query.eq('is_published', true);
      }
      // Teachers see their own exams
      else if (user.role === 'teacher') {
        query = query.eq('teacher_id', user.id);
      }
      // Admins see all exams

      const { data, error } = await query;

      if (error) {
        console.error('Error loading exams:', error);
        return;
      }

      console.log('Loaded exams data:', data);

      if (data) {
        const formattedExams: Exam[] = data.map(exam => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || '',
          subject: exam.subjects?.name || 'General',
          duration: exam.duration_minutes,
          startTime: new Date(exam.start_time || Date.now()),
          endTime: new Date(exam.end_time || Date.now() + 24 * 60 * 60 * 1000),
          totalPoints: exam.total_marks,
          isActive: exam.is_published,
          allowReview: true,
          shuffleQuestions: false,
          createdBy: exam.teacher_id,
          alwaysAvailable: !exam.start_time,
          questions: exam.questions?.map((q: any) => ({
            id: q.id,
            type: q.question_type as 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer',
            question: q.question_text,
            options: q.options || [],
            correctAnswer: q.correct_answer,
            points: q.marks,
            category: 'General',
            difficulty: 'medium' as const
          })) || []
        }));

        console.log('Formatted exams:', formattedExams);
        setExams(formattedExams);
      }
    } catch (error) {
      console.error('Error in loadExams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttempts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('student_id', user.id);

      if (error) {
        console.error('Error loading attempts:', error);
        return;
      }

      if (data) {
        const formattedAttempts: ExamAttempt[] = data.map(result => ({
          id: result.id,
          examId: result.exam_id,
          studentId: result.student_id,
          answers: result.answers as Record<string, string | string[]>,
          startTime: new Date(result.started_at),
          endTime: result.completed_at ? new Date(result.completed_at) : undefined,
          score: result.score,
          isCompleted: result.is_completed,
          timeSpent: 0,
          warnings: []
        }));

        setAttempts(formattedAttempts);
        setSubmittedExams(formattedAttempts.filter(a => a.isCompleted).map(a => a.examId));
      }
    } catch (error) {
      console.error('Error in loadAttempts:', error);
    }
  };

  const createExam = async (examData: Omit<Exam, 'id'>) => {
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      console.error('Unauthorized: Only teachers and admins can create exams');
      return;
    }

    try {
      console.log('Creating exam with data:', examData);

      // First, get or create the subject
      let subjectId;
      const { data: existingSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', examData.subject)
        .single();

      if (existingSubject) {
        subjectId = existingSubject.id;
        console.log('Using existing subject:', subjectId);
      } else {
        console.log('Creating new subject:', examData.subject);
        const { data: newSubject, error: subjectError } = await supabase
          .from('subjects')
          .insert({ name: examData.subject })
          .select('id')
          .single();

        if (subjectError) {
          console.error('Error creating subject:', subjectError);
          throw subjectError;
        }
        subjectId = newSubject.id;
        console.log('Created new subject:', subjectId);
      }

      // Create the exam
      const examToInsert = {
        title: examData.title,
        description: examData.description,
        subject_id: subjectId,
        teacher_id: user.id,
        duration_minutes: examData.duration,
        total_marks: examData.totalPoints,
        start_time: examData.alwaysAvailable ? null : examData.startTime.toISOString(),
        end_time: examData.alwaysAvailable ? null : examData.endTime.toISOString(),
        is_published: examData.isActive
      };

      console.log('Inserting exam:', examToInsert);

      const { data: examResult, error: examError } = await supabase
        .from('exams')
        .insert(examToInsert)
        .select()
        .single();

      if (examError) {
        console.error('Error creating exam:', examError);
        throw examError;
      }

      console.log('Exam created successfully:', examResult);

      // Create questions
      if (examData.questions.length > 0) {
        const questionsData = examData.questions.map((question, index) => ({
          exam_id: examResult.id,
          question_text: question.question,
          question_type: question.type,
          options: question.options || null,
          correct_answer: Array.isArray(question.correctAnswer) 
            ? question.correctAnswer.join(',') 
            : question.correctAnswer || '',
          marks: question.points,
          order_number: index + 1
        }));

        console.log('Creating questions:', questionsData);

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsData);

        if (questionsError) {
          console.error('Error creating questions:', questionsError);
          throw questionsError;
        }

        console.log('Questions created successfully');
      }

      // Reload exams to get the new one
      await loadExams();
      console.log('Exam creation completed successfully');
    } catch (error) {
      console.error('Error in createExam:', error);
      throw error;
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
      let score = 0;
      currentExam.questions.forEach(question => {
        const userAnswer = currentAttempt.answers[question.id];
        if (userAnswer && userAnswer === question.correctAnswer) {
          score += question.points;
        }
      });

      const { error } = await supabase
        .from('exam_results')
        .insert({
          exam_id: currentExam.id,
          student_id: user.id,
          answers: currentAttempt.answers,
          score,
          total_marks: currentExam.totalPoints,
          started_at: currentAttempt.startTime.toISOString(),
          completed_at: new Date().toISOString(),
          is_completed: true
        });

      if (error) {
        console.error('Error submitting exam:', error);
        return;
      }

      const updatedAttempt = {
        ...currentAttempt,
        endTime: new Date(),
        isCompleted: true,
        score,
        timeSpent: Math.floor((new Date().getTime() - currentAttempt.startTime.getTime()) / 1000)
      };

      setCurrentAttempt(updatedAttempt);
      setAttempts(prev => prev.map(attempt => 
        attempt.id === currentAttempt.id ? updatedAttempt : attempt
      ));
      setSubmittedExams(prev => [...prev, currentExam.id]);
      
      // Reload attempts to get the saved data
      await loadAttempts();
    } catch (error) {
      console.error('Error in submitExam:', error);
    }
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
      hasSubmittedExam,
      setCurrentExam,
      setCurrentAttempt,
      loadExams,
      isLoading
    }}>
      {children}
    </ExamContext.Provider>
  );
};
