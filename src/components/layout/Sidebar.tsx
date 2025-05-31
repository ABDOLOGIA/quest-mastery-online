
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  BookOpen,
  Clock,
  Award,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'exams', label: 'All Exams', icon: FileText },
        { id: 'analytics', label: 'System Analytics', icon: BarChart3 },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'my-exams', label: 'My Exams', icon: FileText },
        { id: 'create-exam', label: 'Create Exam', icon: PlusCircle },
        { id: 'questions', label: 'Question Bank', icon: BookOpen },
        { id: 'grading', label: 'Grading', icon: Award },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ];
    }

    // Student menu
    return [
      ...baseItems,
      { id: 'exams', label: 'Available Exams', icon: FileText },
      { id: 'my-results', label: 'My Results', icon: Award },
      { id: 'schedule', label: 'Exam Schedule', icon: Clock },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === item.id 
                  ? 'bg-primary text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
