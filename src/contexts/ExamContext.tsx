import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';

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
      setupRealTimeSubscriptions();
    }
  }, [user]);

  const setupRealTimeSubscriptions = () => {
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

    return () => {
      supabase.removeChannel(examChannel);
      supabase.removeChannel(studentExamChannel);
    };
  };

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      if (user.role === 'teacher') {
        // Load teacher-specific stats
        const [studentsResult, activeExamsResult, pendingGradingResult] = await Promise.all([
          supabase.rpc('get_teacher_students_count'),
          supabase.rpc('get_teacher_active_exams_count', { teacher_id_param: user.id }),
          supabase.rpc('get_teacher_pending_grading_new', { teacher_id_param: user.id })
        ]);

        setDashboardStats({
          studentsCount: studentsResult.data || 0,
          activeExamsCount: activeExamsResult.data || 0,
          pendingGradingCount: pendingGradingResult.data || 0
        });
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadAllStudents = async () => {
    if (!user || user.role !== 'teacher') return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('name');

      if (error) {
        console.error('Error loading students:', error);
        return;
      }

      setAllStudents(data || []);
    } catch (error) {
      console.error('Error in loadAllStudents:', error);
    }
  };

  const loadStudentExams = async () => {
    if (!user) return;

    try {
      if (user.role === 'student') {
        // Students see only their own exam attempts
        const { data, error } = await supabase
          .from('student_exams')
          .select('*')
          .eq('student_id', user.id);

        if (error) {
          console.error('Error loading student exams:', error);
          return;
        }

        if (data) {
          const formattedStudentExams: StudentExam[] = data.map(se => ({
            id: se.id,
            studentId: se.student_id,
            examId: se.exam_id,
            startedAt: new Date(se.started_at),
            submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
            answers: se.answers as Record<string, string | string[]>,
            score: se.score,
            isGraded: se.is_graded,
            isSubmitted: se.is_submitted,
            timeSpent: se.time_spent
          }));

          setStudentExams(formattedStudentExams);
        }
      } else if (user.role === 'teacher') {
        // Teachers see student exams for their exams
        const { data, error } = await supabase
          .from('student_exams')
          .select(`
            *,
            exams!inner(teacher_id)
          `)
          .eq('exams.teacher_id', user.id);

        if (error) {
          console.error('Error loading student exams for teacher:', error);
          return;
        }

        if (data) {
          const formattedStudentExams: StudentExam[] = data.map(se => ({
            id: se.id,
            studentId: se.student_id,
            examId: se.exam_id,
            startedAt: new Date(se.started_at),
            submittedAt: se.submitted_at ? new Date(se.submitted_at) : undefined,
            answers: se.answers as Record<string, string | string[]>,
            score: se.score,
            isGraded: se.is_graded,
            isSubmitted: se.is_submitted,
            timeSpent: se.time_spent
          }));

          setStudentExams(formattedStudentExams);
        }
      }
    } catch (error) {
      console.error('Error in loadStudentExams:', error);
    }
  };

  const getAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) {
        console.error('Error loading students:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      return [];
    }
  };

  const loadExams = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Loading exams for user:', user.id, 'role:', user.role);
      
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

      const { data, error } = await query.order('created_at', { ascending: false });

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
          endTime: new Date(exam.end_time || Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      throw new Error('Unauthorized: Only teachers and admins can create exams');
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

      // Create questions if any
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

      // Show success message
      toast({
        title: "Success",
        description: "Exam created successfully and is now available to students!",
      });

      // Immediately reload exams to get the new one
      await loadExams();
      await loadDashboardStats();
      console.log('Exam creation completed successfully');
    } catch (error) {
      console.error('Error in createExam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
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

      const timeSpent = Math.floor((new Date().getTime() - currentAttempt.startTime.getTime()) / 1000);

      // Insert into student_exams table
      const { error: studentExamError } = await supabase
        .from('student_exams')
        .insert({
          exam_id: currentExam.id,
          student_id: user.id,
          answers: currentAttempt.answers,
          score,
          is_graded: true,
          is_submitted: true,
          time_spent: timeSpent,
          submitted_at: new Date().toISOString()
        });

      if (studentExamError) {
        console.error('Error submitting to student_exams:', studentExamError);
      }

      // Also insert into exam_results for compatibility
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
