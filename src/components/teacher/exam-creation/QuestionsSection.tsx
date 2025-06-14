
import React from 'react';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Plus } from 'lucide-react';
import { Question } from '../../../types/exam';
import QuestionCard from './QuestionCard';
import ErrorMessage from './ErrorMessage';

interface QuestionsSectionProps {
  questions: Question[];
  onAddQuestion: () => void;
  onUpdateQuestion: (index: number, updatedQuestion: Question) => void;
  onRemoveQuestion: (index: number) => void;
  error?: string;
  isSubmitting: boolean;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  error,
  isSubmitting
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-lg font-semibold">Questions</Label>
          {error && <ErrorMessage error={error} />}
        </div>
        <Button
          type="button"
          onClick={onAddQuestion}
          variant="outline"
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          onUpdate={(updatedQuestion) => onUpdateQuestion(index, updatedQuestion)}
          onRemove={() => onRemoveQuestion(index)}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
};

export default QuestionsSection;
