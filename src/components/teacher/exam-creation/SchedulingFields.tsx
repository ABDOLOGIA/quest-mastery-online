
import React from 'react';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Switch } from '../../ui/switch';
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

interface SchedulingFieldsProps {
  formData: FormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  isSubmitting: boolean;
}

const SchedulingFields: React.FC<SchedulingFieldsProps> = ({
  formData,
  errors,
  onInputChange,
  isSubmitting
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="alwaysAvailable"
          checked={formData.alwaysAvailable}
          onCheckedChange={(checked) => onInputChange('alwaysAvailable', checked)}
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
              onChange={(e) => onInputChange('startTime', new Date(e.target.value))}
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
              onChange={(e) => onInputChange('endTime', new Date(e.target.value))}
              className={errors.endTime ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            <ErrorMessage error={errors.endTime} />
          </div>
        </div>
      )}

      {/* Publish Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => onInputChange('isActive', checked)}
          disabled={isSubmitting}
        />
        <Label htmlFor="isActive">Publish Immediately</Label>
      </div>
    </div>
  );
};

export default SchedulingFields;
