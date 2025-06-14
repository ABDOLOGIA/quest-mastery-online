
import React from 'react';
import { User as UserIcon, Mail, GraduationCap, Hash, Briefcase, IdCard } from 'lucide-react';
import type { User, UserRole } from '../../types/auth';

interface ProfileInfoProps {
  user: User;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <UserIcon className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">Full Name</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Hash className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 font-mono">{user.id}</p>
          <p className="text-xs text-gray-500">User ID</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Mail className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{user.email}</p>
          <p className="text-xs text-gray-500">Email Address</p>
        </div>
      </div>

      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <IdCard className="h-5 w-5 text-gray-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{getRoleDisplay(user.role)}</p>
          <p className="text-xs text-gray-500">Role</p>
        </div>
      </div>

      {user.department && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Briefcase className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user.department}</p>
            <p className="text-xs text-gray-500">Department</p>
          </div>
        </div>
      )}

      {user.role === 'student' && user.studentId && (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <GraduationCap className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user.studentId}</p>
            <p className="text-xs text-gray-500">Student ID</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInfo;
