
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Award, 
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
  TrendingUp,
  BookOpen,
  AlertCircle
} from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams, attempts, hasSubmittedExam } = useExam();
  const [activeTab, setActiveTab] = useState('overview');

  // Filter exams based on current time and submission status
  const now = new Date();
  const availableExams = exams.filter(exam => 
    exam.isActive && 
    new Date(exam.startTime) <= now && 
    new Date(exam.endTime) >= now &&
    !hasSubmittedExam(exam.id, user?.id || '')
  );
  
  const upcomingExams = exams.filter(exam => 
    exam.isActive && 
    new Date(exam.startTime) > now
  );
  
  const completedExams = attempts.filter(attempt => 
    attempt.studentId === user?.id && 
    attempt.isCompleted
  );

  // Calculate average score (only for scored exams)
  const scoredAttempts = completedExams.filter(attempt => attempt.score !== undefined);
  const averageScore = scoredAttempts.length > 0 
    ? scoredAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / scoredAttempts.length 
    : null;

  // Check if all available exams are completed and scored
  const allExamsCompletedAndScored = availableExams.length === 0 && 
    completedExams.every(attempt => attempt.score !== undefined) &&
    completedExams.length > 0;

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
      title: 'Upcoming Exams',
      value: upcomingExams.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Average Score',
      value: allExamsCompletedAndScored && averageScore !== null 
        ? `${averageScore.toFixed(1)}%` 
        : 'Pending',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedExams.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No completed exams yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Take your first exam to see your progress here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedExams.slice(0, 5).map((attempt) => {
                const exam = exams.find(e => e.id === attempt.examId);
                return (
                  <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{exam?.title}</h4>
                      <p className="text-sm text-gray-500">
                        Completed on {new Date(attempt.endTime!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {attempt.score !== undefined ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {attempt.score}%
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Score Info */}
      {!allExamsCompletedAndScored && completedExams.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Average Score Calculation
                </p>
                <p className="text-xs text-yellow-700">
                  Your average score will be available after all exams are completed and scored by teachers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAvailableExams = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2 text-primary" />
          Available Exams
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableExams.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No exams available at the moment</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back later or view upcoming exams in the schedule
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableExams.map((exam) => (
              <div key={exam.id} className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
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
                        <BookOpen className="w-4 h-4 mr-1" />
                        {exam.questions.length} questions
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Available until: {new Date(exam.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="default" className="bg-green-100 text-green-800 mb-3">
                      Available Now
                    </Badge>
                    <div>
                      <Button className="w-full">
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
  );

  const renderExamSchedule = () => (
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
            <p className="text-gray-500">No upcoming exams scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="p-6 border rounded-lg">
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
                        <BookOpen className="w-4 h-4 mr-1" />
                        {exam.questions.length} questions
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">
                        Scheduled for: {new Date(exam.startTime).toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Available from {new Date(exam.startTime).toLocaleString()} to {new Date(exam.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Badge variant="secondary">
                      Upcoming
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />
          My Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedExams.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No exam results yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your results will appear here after completing exams
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedExams.map((attempt) => {
              const exam = exams.find(e => e.id === attempt.examId);
              return (
                <div key={attempt.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{exam?.title}</h4>
                      <p className="text-sm text-gray-600">{exam?.subject}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Completed: {new Date(attempt.endTime!).toLocaleString()}</p>
                        <p>Time spent: {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</p>
                        {attempt.warnings.length > 0 && (
                          <p className="text-orange-600">Warnings: {attempt.warnings.length}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {attempt.score !== undefined ? (
                        <div>
                          <Badge 
                            variant="default" 
                            className={`${
                              attempt.score >= 80 ? 'bg-green-100 text-green-800' :
                              attempt.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {attempt.score}%
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {attempt.score}/{exam?.totalPoints}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="secondary">
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Average Score Display */}
            {allExamsCompletedAndScored && averageScore !== null && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Overall Average</h3>
                  <p className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {scoredAttempts.length} completed exam{scoredAttempts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">Track your exam progress and performance.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'available', label: 'Available Exams', icon: FileText },
            { id: 'schedule', label: 'Exam Schedule', icon: Calendar },
            { id: 'results', label: 'My Results', icon: Award }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'available' && renderAvailableExams()}
      {activeTab === 'schedule' && renderExamSchedule()}
      {activeTab === 'results' && renderResults()}
    </div>
  );
};

export default StudentDashboard;
