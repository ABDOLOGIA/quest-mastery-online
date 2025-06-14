
import React from 'react';
import { UserIcon, Mail, GraduationCap, Building, Hash } from 'lucide-react';
import type { User } from '../../types/auth';

interface UserProfileInfoProps {
  user: User;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <UserIcon className="h-4 w-4 text-gray-400" />
        <div>
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
          <p className="text-xs text-gray-500">Full Name</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Hash className="h-4 w-4 text-gray-400" />
        <div>
          <span className="text-sm font-medium text-gray-900">{user.id}</span>
          <p className="text-xs text-gray-500">User ID</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Mail className="h-4 w-4 text-gray-400" />
        <div>
          <span className="text-sm text-gray-600">{user.email}</span>
          <p className="text-xs text-gray-500">Email Address</p>
        </div>
      </div>

      {user.department && (
        <div className="flex items-center space-x-3">
          <Building className="h-4 w-4 text-gray-400" />
          <div>
            <span className="text-sm text-gray-600">{user.department}</span>
            <p className="text-xs text-gray-500">Department</p>
          </div>
        </div>
      )}

      {user.studentId && (
        <div className="flex items-center space-x-3">
          <GraduationCap className="h-4 w-4 text-gray-400" />
          <div>
            <span className="text-sm text-gray-600">{user.studentId}</span>
            <p className="text-xs text-gray-500">Student ID</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileInfo;
