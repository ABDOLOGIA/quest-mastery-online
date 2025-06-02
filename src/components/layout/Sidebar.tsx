
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  Home, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  User,
  ArrowLeft
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

    if (user?.role === 'student') {
      return [
        ...common.slice(0, 1), // Dashboard
        { id: 'exams', label: 'Available Exams', icon: FileText },
        { id: 'schedule', label: 'Exam Schedule', icon: Calendar },
        { id: 'results', label: 'My Results', icon: BarChart3 },
        ...common.slice(1) // Profile, Settings
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...common.slice(0, 1), // Dashboard
        { id: 'questions', label: 'Questions', icon: FileText },
        { id: 'exams', label: 'Manage Exams', icon: Calendar },
        { id: 'results', label: 'Results', icon: BarChart3 },
        ...common.slice(1) // Profile, Settings
      ];
    }

    return common; // Admin
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {user?.role === 'student' ? 'Student Portal' : 
           user?.role === 'teacher' ? 'Teacher Portal' : 'Admin Portal'}
        </h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-3" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
