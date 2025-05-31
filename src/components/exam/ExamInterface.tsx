
import React, { useState, useEffect } from 'react';
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
  Eye,
  EyeOff
} from 'lucide-react';

const ExamInterface: React.FC = () => {
  const { currentExam, currentAttempt, submitAnswer, submitExam } = useExam();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  // Security monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isExamSubmitted) {
        setTabSwitchWarnings(prev => prev + 1);
        setShowSecurityWarning(true);
        setTimeout(() => setShowSecurityWarning(false), 5000);
        
        if (tabSwitchWarnings >= 2) {
          alert('Multiple tab switches detected. This exam will be flagged for review.');
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabSwitchWarnings, isExamSubmitted]);

  // Timer
  useEffect(() => {
    if (!currentExam || !currentAttempt || isExamSubmitted) return;

    const examDuration = currentExam.duration * 60; // Convert to seconds
    const startTime = new Date(currentAttempt.startTime).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, examDuration - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        handleSubmitExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, currentAttempt, isExamSubmitted]);

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
    submitAnswer(questionId, answer);
  };

  const handleSubmitExam = () => {
    setIsExamSubmitted(true);
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

  if (isExamSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Exam Submitted</h3>
            <p className="text-gray-600">Your exam has been submitted successfully.</p>
            {currentAttempt.score !== undefined && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-800">
                  Score: {currentAttempt.score}/{currentExam.totalPoints}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Security Warning Overlay */}
      {showSecurityWarning && (
        <div className="security-overlay animate-fade-in">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Security Warning</h3>
              <p className="text-red-600">Tab switching detected! This activity is being monitored.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
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
              {tabSwitchWarnings > 0 && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Warnings: {tabSwitchWarnings}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`exam-timer ${timeRemaining < 300 ? 'text-red-500 animate-pulse-warning' : 'text-gray-900'}`}>
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
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded mr-2"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center">
                    <Flag className="w-3 h-3 text-red-500 mr-2" />
                    <span>Flagged</span>
                  </div>
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

                {/* Answer Input */}
                <div className="space-y-4">
                  {currentQuestion.type === 'single-choice' && (
                    <RadioGroup
                      value={answers[currentQuestion.id] as string || ''}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
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
                          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
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
