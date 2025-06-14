
import React from 'react';
import { UserIcon, Building, GraduationCap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { User } from '../../types/auth';

interface EditForm {
  name: string;
  department: string;
  studentId: string;
  avatar: string;
}

interface UserProfileFormProps {
  user: User;
  editForm: EditForm;
  isLoading: boolean;
  onFormChange: (updates: Partial<EditForm>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  user,
  editForm,
  isLoading,
  onFormChange,
  onSave,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            value={editForm.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            className="pl-10"
            placeholder="Enter full name"
          />
        </div>
      </div>

      {user.role === 'teacher' && (
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="department"
              value={editForm.department}
              onChange={(e) => onFormChange({ department: e.target.value })}
              className="pl-10"
              placeholder="Enter department"
            />
          </div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="space-y-2">
          <Label htmlFor="studentId">Student ID</Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="studentId"
              value={editForm.studentId}
              onChange={(e) => onFormChange({ studentId: e.target.value })}
              className="pl-10"
              placeholder="Enter student ID"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="avatar">Avatar URL</Label>
        <Input
          id="avatar"
          value={editForm.avatar}
          onChange={(e) => onFormChange({ avatar: e.target.value })}
          placeholder="Enter avatar image URL"
        />
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={onSave}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default UserProfileForm;
