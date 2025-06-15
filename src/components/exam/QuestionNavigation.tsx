
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Flag } from 'lucide-react';
import { Exam } from '../../types/exam';

interface QuestionNavigationProps {
  exam: Exam;
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>;
  flaggedQuestions: Set<string>;
  lastSaveTime: Date;
  warningsCount: number;
  maxWarnings: number;
  onQuestionSelect: (index: number) => void;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
  exam,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  lastSaveTime,
  warningsCount,
  maxWarnings,
  onQuestionSelect
}) => {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-sm">Question Navigation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {exam.questions.map((question, index) => {
            const isAnswered = answers[question.id] !== undefined;
            const isFlagged = flaggedQuestions.has(question.id);
            const isCurrent = index === currentQuestionIndex;
            
            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
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
            <span>Not Answered ({exam.questions.length - Object.keys(answers).length})</span>
          </div>
          <div className="flex items-center">
            <Flag className="w-3 h-3 text-red-500 mr-2" />
            <span>Flagged ({flaggedQuestions.size})</span>
          </div>
        </div>

        {/* Auto-save info */}
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
          {warningsCount > 0 && (
            <p className="text-red-600 font-medium mt-1">
              Warnings: {warningsCount}/{maxWarnings}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionNavigation;
