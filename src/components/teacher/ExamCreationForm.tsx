
import React, { useState } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Save, X, Loader2 } from 'lucide-react';
import { Question } from '../../types/exam';
import { validateExam, formatValidationErrors } from '../../utils/examValidation';
import PermissionCheck from './exam-creation/PermissionCheck';
import BasicInfoFields from './exam-creation/BasicInfoFields';
import SchedulingFields from './exam-creation/SchedulingFields';
import QuestionsSection from './exam-creation/QuestionsSection';
import GeneralErrorDisplay from './exam-creation/GeneralErrorDisplay';

interface ExamCreationFormProps {
  onExamCreated?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  title?: string;
  subject?: string;
  duration?: string;
  totalPoints?: string;
  startTime?: string;
  endTime?: string;
  questions?: string;
  general?: string;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({ onExamCreated, onCancel }) => {
  const { createExam, isLoading } = useExam();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    totalPoints: 100,
    isActive: true,
    alwaysAvailable: true,
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000)
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Create exam data object
    const examData = {
      ...formData,
      questions,
      createdBy: user?.id || '',
      allowReview: true,
      shuffleQuestions: false
    };

    // Validate exam data
    const validationErrors = validateExam(examData);
    if (validationErrors.length > 0) {
      const fieldErrors: FormErrors = {};
      validationErrors.forEach(error => {
        if (error.field.includes('question')) {
          fieldErrors.questions = 'Please fix question validation errors';
        } else {
          fieldErrors[error.field as keyof FormErrors] = error.message;
        }
      });
      
      setErrors(fieldErrors);
      
      // Focus on first error field
      const firstErrorField = Object.keys(fieldErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      toast({
        title: "Validation Error",
        description: formatValidationErrors(validationErrors),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting exam data:', examData);
      console.log('User creating exam:', user?.id, 'role:', user?.role);
      
      await createExam(examData);

      toast({
        title: "Success!",
        description: `Exam "${formData.title}" created successfully!`,
      });

      if (onExamCreated) {
        onExamCreated();
      }
    } catch (error) {
      console.error('Exam creation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setErrors({ 
        general: errorMessage 
      });

      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: 'single-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      category: 'General',
      difficulty: 'medium'
    };
    setQuestions([...questions, newQuestion]);
    
    // Clear questions error when adding a question
    if (errors.questions) {
      setErrors(prev => ({ ...prev, questions: undefined }));
    }
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const retrySubmission = () => {
    setErrors({});
    handleSubmit(new Event('submit') as any);
  };

  return (
    <PermissionCheck user={user}>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create New Exam</span>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <GeneralErrorDisplay
              error={errors.general}
              onRetry={retrySubmission}
              isSubmitting={isSubmitting}
            />

            <BasicInfoFields
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              isSubmitting={isSubmitting}
            />

            <SchedulingFields
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              isSubmitting={isSubmitting}
            />

            <QuestionsSection
              questions={questions}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onRemoveQuestion={removeQuestion}
              error={errors.questions}
              isSubmitting={isSubmitting}
            />

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Exam
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PermissionCheck>
  );
};

export default ExamCreationForm;
