
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BookOpen, 
  BarChart3,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'subjects', label: 'Subject Management', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 }
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'exams', label: 'My Exams', icon: FileText },
        { id: 'questions', label: 'Question Bank', icon: ClipboardList },
        { id: 'students', label: 'My Students', icon: Users },
        { id: 'results', label: 'Exam Results', icon: BarChart3 }
      ];
    }

    // Student menu items
    return [
      ...baseItems,
      { id: 'available-exams', label: 'Available Exams', icon: FileText },
      { id: 'my-results', label: 'My Results', icon: BarChart3 }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-white shadow-sm border-r h-[calc(100vh-4rem)] flex flex-col">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full flex items-center justify-center"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
