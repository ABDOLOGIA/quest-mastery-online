
import React from 'react';
import { User as UserIcon, Briefcase, IdCard } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { User } from '../../types/auth';

interface ProfileEditFormProps {
  user: User;
  editForm: {
    name: string;
    studentId: string;
    avatar: string;
    department: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    studentId: string;
    avatar: string;
    department: string;
  }>>;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ user, editForm, setEditForm }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            className="pl-10"
            placeholder="Enter full name"
            required
          />
        </div>
      </div>

      {user.role === 'student' && (
        <div className="space-y-2">
          <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">Student ID</Label>
          <div className="relative">
            <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="studentId"
              value={editForm.studentId}
              onChange={(e) => setEditForm(prev => ({ ...prev, studentId: e.target.value }))}
              className="pl-10"
              placeholder="Enter student ID"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="department"
            value={editForm.department}
            onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
            className="pl-10"
            placeholder="Enter department"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">Avatar URL</Label>
        <Input
          id="avatar"
          value={editForm.avatar}
          onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
          placeholder="Enter avatar image URL"
        />
      </div>
    </div>
  );
};

export default ProfileEditForm;
