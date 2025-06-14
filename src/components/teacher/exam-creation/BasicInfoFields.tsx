
import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import ErrorMessage from './ErrorMessage';

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

interface FormData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalPoints: number;
  isActive: boolean;
  alwaysAvailable: boolean;
  startTime: Date;
  endTime: Date;
}

interface BasicInfoFieldsProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  isSubmitting: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  formData,
  errors,
  onInputChange,
  isSubmitting
}) => {
  return (
    <>
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Exam Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
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
            onChange={(e) => onInputChange('subject', e.target.value)}
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
          onChange={(e) => onInputChange('description', e.target.value)}
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
            onChange={(e) => onInputChange('duration', parseInt(e.target.value) || 0)}
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
            onChange={(e) => onInputChange('totalPoints', parseInt(e.target.value) || 0)}
            min="1"
            className={errors.totalPoints ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          <ErrorMessage error={errors.totalPoints} />
        </div>
      </div>
    </>
  );
};

export default BasicInfoFields;
