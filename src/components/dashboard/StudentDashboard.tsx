
import React from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  FileText, 
  Award, 
  Calendar,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { exams, startExam } = useExam();

  const availableExams = exams.filter(exam => exam.isActive);
  const upcomingExams = exams.filter(exam => new Date(exam.startTime) > new Date());

  const handleStartExam = (examId: string) => {
    const attempt = startExam(examId, 'current-student-id');
    if (attempt) {
      console.log('Exam started:', attempt);
    }
  };

  const stats = [
    {
      title: 'Available Exams',
      value: availableExams.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed Exams',
      value: 12,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Score',
      value: '87%',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Upcoming Exams',
      value: upcomingExams.length,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your exam overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available Exams */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PlayCircle className="w-5 h-5 mr-2 text-primary" />
            Available Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableExams.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No exams available at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableExams.map((exam) => (
                <div key={exam.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                      <p className="text-gray-600 mt-1">{exam.description}</p>
                      <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {exam.duration} minutes
                        </div>
                        <div className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {exam.totalPoints} points
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {exam.questions.length} questions
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge variant="secondary" className="mb-2">
                        Active
                      </Badge>
                      <div>
                        <Button 
                          onClick={() => handleStartExam(exam.id)}
                          className="bg-exam-active hover:bg-exam-active/90"
                        >
                          Start Exam
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium">Completed: Database Management Exam</p>
                <p className="text-xs text-gray-500">Score: 92% - 2 days ago</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium">New exam available: Web Development Fundamentals</p>
                <p className="text-xs text-gray-500">Posted 1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
