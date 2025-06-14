
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import UserProfileModal from '../profile/UserProfileModal';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  if (!user) return null;

  return (
    <>
      <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Exam Management System
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 p-2"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userId={user.id}
        canEdit={true}
      />
    </>
  );
};

export default Header;
