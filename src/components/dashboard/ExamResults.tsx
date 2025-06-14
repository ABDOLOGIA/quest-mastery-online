
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useExam } from '../../contexts/ExamContext';
import { Trophy, Clock, Calendar } from 'lucide-react';

const ExamResults = () => {
  const { attempts, exams, isLoading } = useExam();

  const completedAttempts = attempts.filter(attempt => attempt.isCompleted);

  const getExamTitle = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam?.title || 'Unknown Exam';
  };

  const getExamTotalPoints = (examId: string) => {
    const exam = exams.find(e => e.id === examId);
    return exam?.totalPoints || 0;
  };

  const getScorePercentage = (score: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((score / total) * 100);
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'bg-green-100 text-green-800' };
    if (percentage >= 80) return { grade: 'B', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage >= 60) return { grade: 'D', color: 'bg-orange-100 text-orange-800' };
    return { grade: 'F', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            My Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-12"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
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
          <Trophy className="h-5 w-5" />
          My Results ({completedAttempts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedAttempts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed exams yet.</p>
            <p className="text-sm mt-2">Start taking exams to see your results here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedAttempts.map((attempt) => {
              const totalPoints = getExamTotalPoints(attempt.examId);
              const percentage = getScorePercentage(attempt.score || 0, totalPoints);
              const gradeBadge = getGradeBadge(percentage);
              
              return (
                <div key={attempt.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {getExamTitle(attempt.examId)}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {attempt.endTime?.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s
                        </div>
                      </div>
                    </div>
                    <Badge className={gradeBadge.color}>{gradeBadge.grade}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {attempt.score || 0} / {totalPoints} points
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {percentage}%
                    </div>
                  </div>
                  
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamResults;
