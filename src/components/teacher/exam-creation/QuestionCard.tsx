
import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Trash2 } from 'lucide-react';
import { Question } from '../../../types/exam';

interface QuestionCardProps {
  question: Question;
  index: number;
  onUpdate: (updatedQuestion: Question) => void;
  onRemove: () => void;
  isSubmitting: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  onUpdate,
  onRemove,
  isSubmitting
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Question {index + 1}</Badge>
          <Button
            type="button"
            onClick={onRemove}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <Label>Question Text</Label>
          <Textarea
            value={question.question}
            onChange={(e) => onUpdate({ ...question, question: e.target.value })}
            placeholder="Enter your question"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Question Type</Label>
            <select
              value={question.type}
              onChange={(e) => onUpdate({ ...question, type: e.target.value as any })}
              className="w-full p-2 border rounded-md"
              disabled={isSubmitting}
            >
              <option value="single-choice">Single Choice</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="fill-blank">Fill in the Blank</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>

          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) => onUpdate({ ...question, points: parseInt(e.target.value) || 1 })}
              min="1"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {(question.type === 'single-choice' || question.type === 'multiple-choice') && (
          <div>
            <Label>Options</Label>
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2 mt-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[optionIndex] = e.target.value;
                    onUpdate({ ...question, options: newOptions });
                  }}
                  placeholder={`Option ${optionIndex + 1}`}
                  disabled={isSubmitting}
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <Label>Correct Answer</Label>
          <Input
            value={Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
            onChange={(e) => onUpdate({ ...question, correctAnswer: e.target.value })}
            placeholder="Enter correct answer"
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
