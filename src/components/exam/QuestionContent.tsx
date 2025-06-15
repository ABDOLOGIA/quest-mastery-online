
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { Question } from '../../types/exam';

interface QuestionContentProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  answer: string | string[] | undefined;
  isFlagged: boolean;
  onAnswerChange: (answer: string | string[]) => void;
  onToggleFlag: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  question,
  questionIndex,
  totalQuestions,
  answer,
  isFlagged,
  onAnswerChange,
  onToggleFlag,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}) => {
  return (
    <Card className="question-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              Question {questionIndex + 1}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({question.points} points)
              </span>
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFlag}
            className={isFlagged ? 'text-red-500' : 'text-gray-500'}
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg text-gray-900 leading-relaxed">
          {question.question}
        </div>

        {/* Answer Input */}
        <div className="space-y-4">
          {question.type === 'single-choice' && (
            <RadioGroup
              value={answer as string || ''}
              onValueChange={onAnswerChange}
            >
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'multiple-choice' && (
            <div className="space-y-3">
              {question.options?.map((option, index) => {
                const selectedOptions = (answer as string[]) || [];
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
                    <Checkbox
                      id={`option-${index}`}
                      checked={selectedOptions.includes(option)}
                      onCheckedChange={(checked) => {
                        const newSelection = checked
                          ? [...selectedOptions, option]
                          : selectedOptions.filter(item => item !== option);
                        onAnswerChange(newSelection);
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

          {question.type === 'fill-blank' && (
            <Input
              placeholder="Enter your answer..."
              value={answer as string || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="text-lg p-4"
            />
          )}

          {question.type === 'short-answer' && (
            <Textarea
              placeholder="Enter your answer..."
              value={answer as string || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="min-h-32 text-lg p-4"
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!canGoNext}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionContent;
