
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { canCreateContent } from '../../../utils/roleHelpers';
import { 
  FileText, 
  PlusCircle,
  Clock,
  Award,
  Eye,
  BarChart3,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { Exam } from '../../../types/exam';

interface TeacherExamsListProps {
  exams: Exam[];
  user: any;
  showExamForm: boolean;
  isLoading: boolean;
  refreshing: boolean;
  onShowExamForm: (show: boolean) => void;
  onRefresh: () => void;
}

const TeacherExamsList: React.FC<TeacherExamsListProps> = ({
  exams,
  user,
  showExamForm,
  isLoading,
  refreshing,
  onShowExamForm,
  onRefresh
}) => {
  if (showExamForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => onShowExamForm(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">My Exams ({exams.length})</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onRefresh} disabled={refreshing || isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canCreateContent(user) && (
            <Button onClick={() => onShowExamForm(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Exam
            </Button>
          )}
        </div>
      </div>

      {isLoading || refreshing ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading exams...</p>
          </CardContent>
        </Card>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No exams created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first exam to get started</p>
            {canCreateContent(user) && (
              <Button className="mt-4" onClick={() => onShowExamForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Your First Exam
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-gray-600 mt-1">{exam.description}</p>
                    <p className="text-sm text-blue-600 font-medium mt-1">Subject: {exam.subject}</p>
                    <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {exam.duration} minutes
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {exam.questions.length} questions
                      </div>
                      <div className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {exam.totalPoints} points
                      </div>
                    </div>
                    {exam.alwaysAvailable ? (
                      <p className="text-xs text-green-600 font-medium mt-2">
                        ✓ Always available
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        Available: {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right space-y-2">
                    <Badge variant={exam.isActive ? "default" : "secondary"}>
                      {exam.isActive ? 'Published' : 'Draft'}
                    </Badge>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Results
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default TeacherExamsList;
