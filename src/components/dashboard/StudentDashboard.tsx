
import React from 'react';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
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
  AlertCircle,
  BookOpen
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { exams, startExam, attempts, hasSubmittedExam } = useExam();
  const { user } = useAuth();

  const availableExams = exams.filter(exam => 
    exam.isActive && !hasSubmittedExam(exam.id, user?.id || '')
  );
  
  const completedExams = attempts.filter(attempt => 
    attempt.studentId === user?.id && attempt.isCompleted
  );

  const upcomingExams = exams.filter(exam => 
    exam.scheduledDate && new Date(exam.scheduledDate) > new Date()
  );

  // Calculate average score only if all available exams are completed and scored
  const scoredExams = completedExams.filter(attempt => attempt.score !== undefined);
  const averageScore = scoredExams.length > 0 && scoredExams.length === exams.length 
    ? Math.round(scoredExams.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / scoredExams.length)
    : null;

  const handleStartExam = (examId: string) => {
    const attempt = startExam(examId, user?.id || 'current-student-id');
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
      value: completedExams.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Score',
      value: averageScore !== null ? `${averageScore}%` : 'N/A',
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
        <p className="text-gray-600">Welcome back, {user?.name}! Here's your exam overview.</p>
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {exam.subject}
                        </Badge>
                      </div>
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
                          <BookOpen className="w-4 h-4 mr-1" />
                          {exam.questions.length} questions
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800">
                        Available
                      </Badge>
                      <div>
                        <Button 
                          onClick={() => handleStartExam(exam.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
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

      {/* Exam Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Exam Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming scheduled exams</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{exam.title}</h4>
                    <p className="text-sm text-gray-600">{exam.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-800">
                      {exam.scheduledDate?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-blue-600">
                      {exam.scheduledDate?.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
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
            {completedExams.slice(0, 3).map((attempt, index) => {
              const exam = exams.find(e => e.id === attempt.examId);
              return (
                <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium">Completed: {exam?.title}</p>
                    <p className="text-xs text-gray-500">
                      {attempt.score !== undefined 
                        ? `Score: ${attempt.score}/${exam?.totalPoints} - ${attempt.endTime?.toLocaleDateString()}`
                        : 'Awaiting teacher review'
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
