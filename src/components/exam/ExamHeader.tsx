
import React from 'react';
import { Button } from '../ui/button';
import { Clock, Save, Shield } from 'lucide-react';
import { Exam } from '../../types/exam';

interface ExamHeaderProps {
  exam: Exam;
  currentQuestionIndex: number;
  timeRemaining: number;
  autoSaveStatus: 'saved' | 'saving' | 'error';
  lastSaveTime: Date;
  warningsCount: number;
  maxWarnings: number;
  onSubmitExam: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({
  exam,
  currentQuestionIndex,
  timeRemaining,
  autoSaveStatus,
  lastSaveTime,
  warningsCount,
  maxWarnings,
  onSubmitExam
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-6">
            {/* Auto-save status */}
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
            {warningsCount > 0 && (
              <div className="flex items-center text-red-600">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">⚠️ {warningsCount}/{maxWarnings}</span>
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : timeRemaining < 600 ? 'text-orange-500' : 'text-gray-500'}`} />
              <span className={`exam-timer font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : timeRemaining < 600 ? 'text-orange-500' : 'text-gray-900'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button 
              onClick={onSubmitExam}
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
  );
};

export default ExamHeader;
