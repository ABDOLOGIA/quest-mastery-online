
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { canCreateContent } from '../../../utils/roleHelpers';
import { 
  PlusCircle,
  FileText,
  BarChart3
} from 'lucide-react';

interface TeacherQuickActionsProps {
  user: any;
  onSetActiveTab: (tab: string) => void;
}

const TeacherQuickActions: React.FC<TeacherQuickActionsProps> = ({
  user,
  onSetActiveTab
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {canCreateContent(user) && (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetActiveTab('questions')}>
          <CardContent className="p-6 text-center">
            <PlusCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Manage Questions</h3>
            <p className="text-gray-600 text-sm">Create and organize exam questions</p>
          </CardContent>
        </Card>
      )}

      {canCreateContent(user) && (
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetActiveTab('exams')}>
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Create Exam</h3>
            <p className="text-gray-600 text-sm">Design a new examination</p>
          </CardContent>
        </Card>
      )}

      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetActiveTab('results')}>
        <CardContent className="p-6 text-center">
          <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">View Results</h3>
          <p className="text-gray-600 text-sm">Analyze student performance</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherQuickActions;
