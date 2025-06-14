
import { Exam, ExamAttempt, Warning } from '../../types/exam';
import { createExamInDatabase } from '../../utils/examCreation';
import { submitExamToDatabase } from '../../utils/examOperations';
import { useToast } from '../../hooks/use-toast';

export const useExamActions = (
  user: any,
  exams: Exam[],
  attempts: ExamAttempt[],
  currentAttempt: ExamAttempt | null,
  currentExam: Exam | null,
  setCurrentExam: (exam: Exam | null) => void,
  setCurrentAttempt: (attempt: ExamAttempt | null) => void,
  setAttempts: (attempts: any) => void,
  setSubmittedExams: (submittedExams: any) => void,
  setIsLoading: (loading: boolean) => void,
  loadExams: () => Promise<void>,
  loadDashboardStats: () => Promise<void>,
  loadAttempts: () => Promise<void>,
  loadStudentExams: () => Promise<void>
) => {
  const { toast } = useToast();

  const createExam = async (examData: Omit<Exam, 'id'>) => {
    if (!user) {
      throw new Error('You must be logged in to create exams');
    }

    setIsLoading(true);
    try {
      console.log('Creating exam with user:', user.id, 'role:', user.role);
      console.log('Exam data to create:', examData);
      
      await createExamInDatabase(examData, user);
      
      // Immediately reload exams and stats
      await Promise.all([
        loadExams(),
        loadDashboardStats()
      ]);
      
      console.log('Exam creation completed successfully');
    } catch (error) {
      console.error('Error in createExam context method:', error);
      
      // Log detailed error information for debugging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Re-throw the error so the component can handle it
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

    const updatedAttempt = {
      ...currentAttempt,
      answers: {
        ...currentAttempt.answers,
        [questionId]: answer
      }
    };

    setCurrentAttempt(updatedAttempt);

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

  return {
    createExam,
    hasSubmittedExam,
    startExam,
    submitAnswer,
    addWarning,
    submitExam,
    getExamResults
  };
};
