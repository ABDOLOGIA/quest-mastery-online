
import React from 'react';
import { Button } from '../../ui/button';
import { RefreshCw } from 'lucide-react';

interface TeacherDashboardHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  isLoading: boolean;
}

const TeacherDashboardHeader: React.FC<TeacherDashboardHeaderProps> = ({
  onRefresh,
  refreshing,
  isLoading
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
        <p className="text-gray-600">Manage your exams and track student progress.</p>
      </div>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        disabled={refreshing || isLoading}
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );
};

export default TeacherDashboardHeader;
