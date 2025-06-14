
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useExam } from '../../contexts/ExamContext';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const RecentExamActivity = () => {
  const { studentExams, exams, allStudents, isLoading } = useExam();

  // Get recent exam activities (submissions, pending grading)
  const recentActivities = studentExams
    .filter(se => se.isSubmitted)
    .sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
    .slice(0, 10);

  const getExamTitle = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam?.title || 'Unknown Exam';
  };

  const getStudentName = (studentId: string) => {
    const student = allStudents.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getActivityIcon = (activity: any) => {
    if (activity.isGraded) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getActivityBadge = (activity: any) => {
    if (activity.isGraded) {
      return <Badge variant="secondary" className="text-green-700 bg-green-100">Graded</Badge>;
    }
    return <Badge variant="secondary" className="text-orange-700 bg-orange-100">Pending</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent exam activity.</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getActivityIcon(activity)}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getStudentName(activity.studentId)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Submitted: {getExamTitle(activity.examId)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {activity.submittedAt && new Date(activity.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {getActivityBadge(activity)}
                    {activity.score !== undefined && activity.score !== null && (
                      <span className="text-xs text-gray-500">
                        Score: {activity.score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExamActivity;
