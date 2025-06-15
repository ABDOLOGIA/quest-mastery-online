import React, { useState, useEffect, useCallback } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  X,
  Home,
  Save,
  Shield
} from 'lucide-react';

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

  // Enhanced auto-save functionality with better error handling
  const autoSave = useCallback(async () => {
    if (!currentAttempt || !currentExam || isExamSubmitted || examClosed) return;
    
    setAutoSaveStatus('saving');
    try {
      // Auto-save current answers with validation
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

  // Auto-save every 15 seconds (more frequent for better security)
  useEffect(() => {
    const autoSaveInterval = setInterval(autoSave, 15000);
    return () => clearInterval(autoSaveInterval);
  }, [autoSave]);

  // Enhanced security monitoring with comprehensive detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isExamSubmitted && !examClosed) {
        addWarningToSystem('Tab Switch', 'Student switched tabs or minimized browser during exam');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Copy Attempt', 'Student attempted to copy content during exam');
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Paste Attempt', 'Student attempted to paste content during exam');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Right Click', 'Student attempted to access context menu');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block developer tools and common shortcuts
      const blockedKeys = [
        'F12',
        'F5', // Refresh
        'F11', // Fullscreen toggle
      ];
      
      const blockedCombos = [
        { ctrl: true, shift: true, key: 'I' }, // Dev tools
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, shift: true, key: 'C' }, // Inspector
        { ctrl: true, key: 'U' }, // View source
        { ctrl: true, key: 'S' }, // Save page
        { ctrl: true, key: 'A' }, // Select all
        { ctrl: true, key: 'C' }, // Copy
        { ctrl: true, key: 'V' }, // Paste
        { ctrl: true, key: 'X' }, // Cut
        { ctrl: true, key: 'R' }, // Refresh
        { ctrl: true, key: 'H' }, // History
        { alt: true, key: 'Tab' }, // Alt+Tab
      ];

      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        addWarningToSystem('Blocked Key', `Student attempted to use ${e.key}`);
        return;
      }

      const isBlockedCombo = blockedCombos.some(combo => 
        (!combo.ctrl || e.ctrlKey) &&
        (!combo.shift || e.shiftKey) &&
        (!combo.alt || e.altKey) &&
        e.key.toLowerCase() === combo.key.toLowerCase()
      );

      if (isBlockedCombo && !isExamSubmitted && !examClosed) {
        e.preventDefault();
        addWarningToSystem('Blocked Shortcut', `Student attempted to use blocked keyboard shortcut`);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isExamSubmitted && !examClosed) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your exam progress will be auto-saved but you may lose time.';
        addWarningToSystem('Page Leave Attempt', 'Student attempted to leave the exam page');
        // Trigger emergency auto-save
        autoSave();
      }
    };

    const handleResize = () => {
      if (!isExamSubmitted && !examClosed) {
        addWarningToSystem('Window Resize', 'Window size changed during exam (possible screen sharing)');
      }
    };

    const handleBlur = () => {
      if (!isExamSubmitted && !examClosed) {
        addWarningToSystem('Focus Lost', 'Browser window lost focus during exam');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handleBlur);

    // Disable text selection to prevent copying
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handleBlur);
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isExamSubmitted, examClosed, autoSave]);

  const addWarningToSystem = (type: string, message: string) => {
    const newWarning = { type, message, timestamp: new Date() };
    setWarnings(prev => [...prev, newWarning]);
    setWarningMessage(message);
    setShowSecurityWarning(true);
    
    // Trigger immediate auto-save when warning occurs
    autoSave();
    
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
  };

  // Enhanced timer with better accuracy
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
      if (remaining === 600) { // 10 minutes
        addWarningToSystem('Time Warning', '10 minutes remaining');
      } else if (remaining === 300) { // 5 minutes
        addWarningToSystem('Time Warning', '5 minutes remaining');
      } else if (remaining === 60) { // 1 minute
        addWarningToSystem('Time Warning', 'Only 1 minute remaining!');
      }
      
      // Auto-submit when time runs out
      if (remaining === 0) {
        addWarningToSystem('Time Up', 'Exam time expired - auto-submitting');
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, currentAttempt, isExamSubmitted, examClosed, warnings.length]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    // Immediate save for important changes
    submitAnswer(questionId, answer);
    setAutoSaveStatus('saved');
    setLastSaveTime(new Date());
  };

  const handleSubmitExam = async () => {
    setIsExamSubmitted(true);
    await autoSave(); // Final save before submission
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
  const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Security Warning Overlay */}
      {showSecurityWarning && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Security Warning</h3>
              <p className="text-red-600 font-medium">{warningMessage}</p>
              <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm text-red-700">
                  Warnings: {warnings.length}/{MAX_WARNINGS}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {MAX_WARNINGS - warnings.length} warnings remaining before exam termination
                </p>
              </div>
              <div className="mt-4 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-700">
                  ✅ Your progress has been auto-saved
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Header with Security Status */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentExam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentExam.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Enhanced Auto-save status */}
              <div className="flex items-center text-sm">
                <Save className={`w-4 h-4 mr-1 ${autoSaveStatus === 'saved' ? 'text-green-500' : autoSaveStatus === 'saving' ? 'text-blue-500 animate-spin' : 'text-red-500'}`} />
                <span className={`${autoSaveStatus === 'saved' ? 'text-green-600' : autoSaveStatus === 'saving' ? 'text-blue-600' : 'text-red-600'}`}>
                  {autoSaveStatus === 'saved' ? 'Auto-saved' : autoSaveStatus === 'saving' ? 'Saving...' : 'Save Error'}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({lastSaveTime.toLocaleTimeString()})
                </span>
              </div>

              {/* Security status */}
              {warnings.length > 0 && (
                <div className="flex items-center text-red-600">
                  <Shield className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">⚠️ {warnings.length}/{MAX_WARNINGS}</span>
                </div>
              )}

              {/* Enhanced Timer */}
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : timeRemaining < 600 ? 'text-orange-500' : 'text-gray-500'}`} />
                <span className={`exam-timer font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : timeRemaining < 600 ? 'text-orange-500' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button 
                onClick={handleSubmitExam}
                variant="destructive"
                size="sm"
              >
                Submit Exam
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Question Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {currentExam.questions.map((question, index) => {
                    const isAnswered = answers[question.id] !== undefined;
                    const isFlagged = flaggedQuestions.has(question.id);
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={question.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          w-8 h-8 rounded text-xs font-medium border-2 relative
                          ${isCurrent ? 'border-primary bg-primary text-white' : 
                            isAnswered ? 'border-green-500 bg-green-50 text-green-700' :
                            'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}
                        `}
                      >
                        {index + 1}
                        {isFlagged && (
                          <Flag className="w-2 h-2 text-red-500 absolute -top-1 -right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-50 border-2 border-green-500 rounded mr-2"></div>
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded mr-2"></div>
                    <span>Not Answered ({currentExam.questions.length - Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center">
                    <Flag className="w-3 h-3 text-red-500 mr-2" />
                    <span>Flagged ({flaggedQuestions.size})</span>
                  </div>
                </div>

                {/* Enhanced Auto-save info */}
                <div className="mt-4 p-3 bg-blue-50 rounded text-xs border border-blue-200">
                  <p className="text-blue-700 font-medium">🔒 Secure Auto-save</p>
                  <p className="text-blue-600 mt-1">
                    Last saved: {lastSaveTime.toLocaleTimeString()}
                  </p>
                  <p className="text-blue-600">
                    Saves every 15 seconds
                  </p>
                </div>

                {/* Security info */}
                <div className="mt-2 p-3 bg-red-50 rounded text-xs border border-red-200">
                  <p className="text-red-700 font-medium">🛡️ Anti-cheating Active</p>
                  <p className="text-red-600 mt-1">
                    Monitoring: Tab switches, copy/paste, shortcuts
                  </p>
                  {warnings.length > 0 && (
                    <p className="text-red-600 font-medium mt-1">
                      Warnings: {warnings.length}/{MAX_WARNINGS}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <Card className="question-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Question {currentQuestionIndex + 1}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({currentQuestion.points} points)
                      </span>
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={flaggedQuestions.has(currentQuestion.id) ? 'text-red-500' : 'text-gray-500'}
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </div>

                {/* Enhanced Answer Input */}
                <div className="space-y-4">
                  {currentQuestion.type === 'single-choice' && (
                    <RadioGroup
                      value={answers[currentQuestion.id] as string || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion.type === 'multiple-choice' && (
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => {
                        const selectedOptions = (answers[currentQuestion.id] as string[]) || [];
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                            <Checkbox
                              id={`option-${index}`}
                              checked={selectedOptions.includes(option)}
                              onCheckedChange={(checked) => {
                                const newSelection = checked
                                  ? [...selectedOptions, option]
                                  : selectedOptions.filter(item => item !== option);
                                handleAnswerChange(currentQuestion.id, newSelection);
                              }}
                            />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                              {option}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentQuestion.type === 'fill-blank' && (
                    <Input
                      placeholder="Enter your answer..."
                      value={answers[currentQuestion.id] as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="text-lg p-4"
                    />
                  )}

                  {currentQuestion.type === 'short-answer' && (
                    <Textarea
                      placeholder="Enter your answer..."
                      value={answers[currentQuestion.id] as string || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="min-h-32 text-lg p-4"
                    />
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={() => setCurrentQuestionIndex(Math.min(currentExam.questions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === currentExam.questions.length - 1}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;
