
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import type { User, UserRole } from '../../types/auth';

interface UserProfileHeaderProps {
  user: User;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-20 h-20">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="text-lg">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold">{user.name}</h3>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {getRoleDisplay(user.role)}
        </span>
      </div>
    </div>
  );
};

export default UserProfileHeader;
