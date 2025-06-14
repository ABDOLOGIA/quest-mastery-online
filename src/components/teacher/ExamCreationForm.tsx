
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { CalendarIcon, Clock, FileText, Save, X, AlertCircle } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { useToast } from '../ui/use-toast';

interface ExamCreationFormProps {
  onExamCreated: () => void;
  onCancel: () => void;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({ onExamCreated, onCancel }) => {
  const { user } = useAuth();
  const { createExam, isLoading } = useExam();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    totalPoints: 100,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    isActive: false,
    allowReview: true,
    shuffleQuestions: false,
    alwaysAvailable: true
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Exam title is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }

    if (formData.totalPoints <= 0) {
      newErrors.totalPoints = 'Total points must be greater than 0';
    }

    if (!formData.alwaysAvailable) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required when not always available';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required when not always available';
      }
      if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an exam.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const examData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        questions: [], // Start with empty questions array
        duration: formData.duration,
        startTime: formData.alwaysAvailable ? new Date() : (formData.startDate || new Date()),
        endTime: formData.alwaysAvailable ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : (formData.endDate || new Date()),
        totalPoints: formData.totalPoints,
        isActive: formData.isActive,
        allowReview: formData.allowReview,
        shuffleQuestions: formData.shuffleQuestions,
        createdBy: user.id,
        alwaysAvailable: formData.alwaysAvailable
      };

      console.log('Submitting exam data:', examData);
      await createExam(examData);
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        subject: '',
        duration: 60,
        totalPoints: 100,
        startDate: undefined,
        endDate: undefined,
        isActive: false,
        allowReview: true,
        shuffleQuestions: false,
        alwaysAvailable: true
      });
      setErrors({});
      
      onExamCreated();
    } catch (error) {
      console.error('Error creating exam:', error);
      // Error handling is already done in createExam function
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Create New Exam
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title"
                className={errors.title ? 'border-red-500' : ''}
                required
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter subject name"
                className={errors.subject ? 'border-red-500' : ''}
                required
              />
              {errors.subject && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subject}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter exam description"
              rows={3}
            />
          </div>

          {/* Exam Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                min="1"
                className={errors.duration ? 'border-red-500' : ''}
                required
              />
              {errors.duration && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.duration}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points *</Label>
              <Input
                id="totalPoints"
                type="number"
                value={formData.totalPoints}
                onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value) || 0)}
                min="1"
                className={errors.totalPoints ? 'border-red-500' : ''}
                required
              />
              {errors.totalPoints && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.totalPoints}
                </p>
              )}
            </div>
          </div>

          {/* Date Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alwaysAvailable"
                checked={formData.alwaysAvailable}
                onCheckedChange={(checked) => handleInputChange('alwaysAvailable', checked)}
              />
              <Label htmlFor="alwaysAvailable">Always Available</Label>
            </div>

            {!formData.alwaysAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${errors.startDate ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${errors.endDate ? 'border-red-500' : ''}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleInputChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Additional Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Publish immediately</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowReview"
                  checked={formData.allowReview}
                  onCheckedChange={(checked) => handleInputChange('allowReview', checked)}
                />
                <Label htmlFor="allowReview">Allow students to review answers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shuffleQuestions"
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) => handleInputChange('shuffleQuestions', checked)}
                />
                <Label htmlFor="shuffleQuestions">Shuffle questions</Label>
              </div>
            </div>
          </div>

          {/* Error Summary */}
          {hasErrors && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium mb-2">Please fix the following errors:</p>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(errors).map((error, index) => (
                  <li key={index} className="flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Exam'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExamCreationForm;
