
import React, { useState, useEffect, useCallback } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  X,
  Home
} from 'lucide-react';
import SecurityWarning from './SecurityWarning';
import ExamHeader from './ExamHeader';
import QuestionNavigation from './QuestionNavigation';
import QuestionContent from './QuestionContent';
import { useExamSecurity } from '../../hooks/useExamSecurity';

const ExamInterface: React.FC = () => {
  const { currentExam, currentAttempt, submitAnswer, submitExam, addWarning, setCurrentExam, setCurrentAttempt } = useExam();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [warnings, setWarnings] = useState<Array<{type: string, message: string, timestamp: Date}>>([]);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [examClosed, setExamClosed] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [lastSaveTime, setLastSaveTime] = useState<Date>(new Date());
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const MAX_WARNINGS = 3;

  const handleReturnHome = () => {
    setCurrentExam(null);
    setCurrentAttempt(null);
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!currentAttempt || !currentExam || isExamSubmitted || examClosed) return;
    
    setAutoSaveStatus('saving');
    try {
      const validAnswers = Object.entries(answers).filter(([questionId, answer]) => {
        return answer !== null && answer !== undefined && 
               (typeof answer === 'string' ? answer.trim() !== '' : answer.length > 0);
      });

      validAnswers.forEach(([questionId, answer]) => {
        submitAnswer(questionId, answer);
      });
      
      setLastSaveTime(new Date());
      setAutoSaveStatus('saved');
      console.log('Auto-save completed successfully at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('error');
    }
  }, [answers, currentAttempt, currentExam, isExamSubmitted, examClosed, submitAnswer]);

  // Auto-save every 15 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(autoSave, 15000);
    return () => clearInterval(autoSaveInterval);
  }, [autoSave]);

  const addWarningToSystem = useCallback((type: string, message: string) => {
    const newWarning = { type, message, timestamp: new Date() };
    setWarnings(prev => [...prev, newWarning]);
    setWarningMessage(message);
    setShowSecurityWarning(true);
    
    console.log(`Security Warning: ${type} - ${message}`);
    
    // Hide warning after 5 seconds
    setTimeout(() => {
      setShowSecurityWarning(false);
      setWarningMessage('');
    }, 5000);

    // Check if max warnings reached
    if (warnings.length + 1 >= MAX_WARNINGS) {
      setExamClosed(true);
      setWarningMessage('Exam terminated due to multiple security violations');
      setTimeout(() => {
        handleSubmitExam();
      }, 2000);
    }

    // Add warning to exam context
    if (addWarning) {
      addWarning(currentAttempt?.id || '', newWarning);
    }
  }, [warnings.length, currentAttempt, addWarning]);

  // Use the security hook
  useExamSecurity({
    isExamSubmitted,
    examClosed,
    onAddWarning: addWarningToSystem,
    onAutoSave: autoSave
  });

  // Timer logic
  useEffect(() => {
    if (!currentExam || !currentAttempt || isExamSubmitted || examClosed) return;

    const examDuration = currentExam.duration * 60;
    const startTime = new Date(currentAttempt.startTime).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, examDuration - elapsed);
      
      setTimeRemaining(remaining);
      
      // Warning intervals
      if (remaining === 600) {
        addWarningToSystem('Time Warning', '10 minutes remaining');
      } else if (remaining === 300) {
        addWarningToSystem('Time Warning', '5 minutes remaining');
      } else if (remaining === 60) {
        addWarningToSystem('Time Warning', 'Only 1 minute remaining!');
      }
      
      // Auto-submit when time runs out
      if (remaining === 0) {
        addWarningToSystem('Time Up', 'Exam time expired - auto-submitting');
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, currentAttempt, isExamSubmitted, examClosed, warnings.length, addWarningToSystem]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    submitAnswer(questionId, answer);
    setAutoSaveStatus('saved');
    setLastSaveTime(new Date());
  };

  const handleSubmitExam = async () => {
    setIsExamSubmitted(true);
    await autoSave();
    submitExam();
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Early returns for different states
  if (!currentExam || !currentAttempt) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Exam</h3>
            <p className="text-gray-600">Please select an exam to begin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examClosed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-800">Exam Terminated</h3>
            <p className="text-red-600">Your exam has been terminated due to multiple security violations.</p>
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                Total warnings: {warnings.length}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Your answers have been auto-saved and submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExamSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Exam Submitted Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your exam has been submitted successfully. Please wait for the teacher to review and announce your score.
            </p>
            {warnings.length > 0 && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">
                  Total warnings received: {warnings.length}
                </p>
              </div>
            )}
            <Button onClick={handleReturnHome} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <SecurityWarning
        showWarning={showSecurityWarning}
        warningMessage={warningMessage}
        warningsCount={warnings.length}
        maxWarnings={MAX_WARNINGS}
      />

      <ExamHeader
        exam={currentExam}
        currentQuestionIndex={currentQuestionIndex}
        timeRemaining={timeRemaining}
        autoSaveStatus={autoSaveStatus}
        lastSaveTime={lastSaveTime}
        warningsCount={warnings.length}
        maxWarnings={MAX_WARNINGS}
        onSubmitExam={handleSubmitExam}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <QuestionNavigation
              exam={currentExam}
              currentQuestionIndex={currentQuestionIndex}
              answers={answers}
              flaggedQuestions={flaggedQuestions}
              lastSaveTime={lastSaveTime}
              warningsCount={warnings.length}
              maxWarnings={MAX_WARNINGS}
              onQuestionSelect={setCurrentQuestionIndex}
            />
          </div>

          <div className="lg:col-span-3">
            <QuestionContent
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={currentExam.questions.length}
              answer={answers[currentQuestion.id]}
              isFlagged={flaggedQuestions.has(currentQuestion.id)}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              onToggleFlag={() => toggleFlag(currentQuestion.id)}
              onPrevious={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              onNext={() => setCurrentQuestionIndex(Math.min(currentExam.questions.length - 1, currentQuestionIndex + 1))}
              canGoPrevious={currentQuestionIndex > 0}
              canGoNext={currentQuestionIndex < currentExam.questions.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
