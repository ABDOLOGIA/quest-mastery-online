
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { CalendarIcon, Clock, FileText, Save, X } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface ExamCreationFormProps {
  onExamCreated: () => void;
  onCancel: () => void;
}

const ExamCreationForm: React.FC<ExamCreationFormProps> = ({ onExamCreated, onCancel }) => {
  const { user } = useAuth();
  const { createExam } = useExam();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const examData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        questions: [], // Start with empty questions array
        duration: formData.duration,
        startTime: formData.startDate || new Date(),
        endTime: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalPoints: formData.totalPoints,
        isActive: formData.isActive,
        allowReview: formData.allowReview,
        shuffleQuestions: formData.shuffleQuestions,
        createdBy: user.id,
        alwaysAvailable: formData.alwaysAvailable
      };

      await createExam(examData);
      onExamCreated();
    } catch (error) {
      console.error('Error creating exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter subject name"
                required
              />
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
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalPoints">Total Points *</Label>
              <Input
                id="totalPoints"
                type="number"
                value={formData.totalPoints}
                onChange={(e) => handleInputChange('totalPoints', parseInt(e.target.value))}
                min="1"
                required
              />
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
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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
