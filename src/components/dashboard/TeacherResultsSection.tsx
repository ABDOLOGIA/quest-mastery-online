
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart3, FileText, Users, TrendingUp, RefreshCw } from 'lucide-react';

const TeacherResultsSection: React.FC = () => {
  const { user } = useAuth();
  const { exams, attempts, isLoading, loadExams } = useExam();
  const [refreshing, setRefreshing] = useState(false);

  const myExams = exams.filter(exam => 
    exam.createdBy === user?.id || exam.teacher_id === user?.id
  );

  const myExamResults = attempts.filter(attempt =>
    myExams.some(exam => exam.id === attempt.examId)
  );

  const completedResults = myExamResults.filter(result => result.isCompleted);
  const averageScore = completedResults.length > 0 
    ? Math.round(completedResults.reduce((sum, result) => sum + (result.score || 0), 0) / completedResults.length)
    : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExams();
    } finally {
      setRefreshing(false);
    }
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{myExams.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{completedResults.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myExamResults.filter(r => r.isCompleted && !r.score).length}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Exam Results & Analytics
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : myExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No exams created yet.</p>
              <p className="text-sm text-gray-400 mt-1">Create your first exam to see results here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myExams.map((exam) => {
                const examResults = myExamResults.filter(result => result.examId === exam.id);
                const completedCount = examResults.filter(r => r.isCompleted).length;
                const avgScore = completedCount > 0 
                  ? Math.round(examResults
                      .filter(r => r.isCompleted && r.score)
                      .reduce((sum, r) => sum + (r.score || 0), 0) / completedCount)
                  : 0;

                return (
                  <div key={exam.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exam.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Total Points: {exam.totalPoints || exam.total_marks}</span>
                          <span>•</span>
                          <span>Duration: {exam.duration_minutes} min</span>
                          <span>•</span>
                          <span>Submissions: {completedCount}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge 
                          variant="secondary" 
                          className={getScoreBadge(avgScore, 100)}
                        >
                          Avg: {avgScore}%
                        </Badge>
                        <Badge 
                          variant={exam.isActive ? "default" : "secondary"}
                        >
                          {exam.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {examResults.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="ml-2 font-medium">{completedCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">In Progress:</span>
                            <span className="ml-2 font-medium">
                              {examResults.filter(r => !r.isCompleted).length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Pending Grading:</span>
                            <span className="ml-2 font-medium">
                              {examResults.filter(r => r.isCompleted && !r.score).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherResultsSection;
