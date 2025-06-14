import React, { useState } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { AlertCircle, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { Question } from '../../types/exam';

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

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Exam title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0 minutes';
    }

    if (!formData.totalPoints || formData.totalPoints <= 0) {
      newErrors.totalPoints = 'Total points must be greater than 0';
    }

    if (!formData.alwaysAvailable) {
      if (!formData.startTime) {
        newErrors.startTime = 'Start time is required when not always available';
      }
      if (!formData.endTime) {
        newErrors.endTime = 'End time is required when not always available';
      }
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      
      // Focus on first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting exam data:', { ...formData, questions });
      
      await createExam({
        ...formData,
        questions,
        id: ''
      });

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

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center text-red-600 text-sm mt-1">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </div>
    );
  };

  const retrySubmission = () => {
    setErrors({});
    handleSubmit(new Event('submit') as any);
  };

  return (
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
          {/* General Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-red-800 font-medium">Creation Failed</h4>
                  <p className="text-red-700 mt-1">{errors.general}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retrySubmission}
                    disabled={isSubmitting}
                    className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Loader2 className={`w-4 h-4 mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
                    Retry Submission
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title"
                className={errors.title ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <ErrorMessage error={errors.title} />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter subject name"
                className={errors.subject ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <ErrorMessage error={errors.subject} />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Duration and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                min="1"
                className={errors.duration ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <ErrorMessage error={errors.duration} />
            </div>

            <div>
              <Label htmlFor="totalPoints">Total Points *</Label>
              <Input
                id="totalPoints"
                type="number"
                value={formData.totalPoints}
                onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 0)}
                min="1"
                className={errors.totalPoints ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              <ErrorMessage error={errors.totalPoints} />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="alwaysAvailable"
                checked={formData.alwaysAvailable}
                onCheckedChange={(checked) => handleInputChange('alwaysAvailable', checked)}
                disabled={isSubmitting}
              />
              <Label htmlFor="alwaysAvailable">Always Available</Label>
            </div>

            {!formData.alwaysAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime.toISOString().slice(0, 16)}
                    onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
                    className={errors.startTime ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage error={errors.startTime} />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime.toISOString().slice(0, 16)}
                    onChange={(e) => handleInputChange('endTime', new Date(e.target.value))}
                    className={errors.endTime ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  <ErrorMessage error={errors.endTime} />
                </div>
              </div>
            )}
          </div>

          {/* Publish Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive">Publish Immediately</Label>
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg font-semibold">Questions</Label>
                {errors.questions && <ErrorMessage error={errors.questions} />}
              </div>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                disabled={isSubmitting}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={question.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Question {index + 1}</Badge>
                    <Button
                      type="button"
                      onClick={() => removeQuestion(index)}
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
                      onChange={(e) => updateQuestion(index, { ...question, question: e.target.value })}
                      placeholder="Enter your question"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(index, { ...question, type: e.target.value as any })}
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
                        onChange={(e) => updateQuestion(index, { ...question, points: parseInt(e.target.value) || 1 })}
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
                              updateQuestion(index, { ...question, options: newOptions });
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
                      onChange={(e) => updateQuestion(index, { ...question, correctAnswer: e.target.value })}
                      placeholder="Enter correct answer"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

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
  );
};

export default ExamCreationForm;
