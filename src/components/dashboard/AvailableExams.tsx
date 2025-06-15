
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Clock, Users, Play, CalendarClock, Timer } from 'lucide-react';

const AvailableExams = () => {
  const { exams, submittedExams, startExam, isLoading } = useExam();
  const { user } = useAuth();

  const getExamStatus = (exam: any) => {
    const now = new Date();
    
    if (submittedExams.includes(exam.id)) {
      return { 
        status: 'completed', 
        color: 'bg-green-100 text-green-800',
        canStart: false,
        label: 'Completed'
      };
    }
    
    if (exam.alwaysAvailable) {
      return { 
        status: 'available', 
        color: 'bg-green-100 text-green-800',
        canStart: true,
        label: 'Available Now'
      };
    }
    
    if (exam.startTime > now) {
      return { 
        status: 'upcoming', 
        color: 'bg-blue-100 text-blue-800',
        canStart: false,
        label: `Starts ${exam.startTime.toLocaleDateString()} at ${exam.startTime.toLocaleTimeString()}`
      };
    }
    
    if (exam.endTime < now) {
      return { 
        status: 'expired', 
        color: 'bg-gray-100 text-gray-800',
        canStart: false,
        label: 'Expired'
      };
    }
    
    return { 
      status: 'available', 
      color: 'bg-green-100 text-green-800',
      canStart: true,
      label: `Available until ${exam.endTime.toLocaleDateString()}`
    };
  };

  // Filter exams that should be visible to students
  const visibleExams = exams.filter(exam => exam.isActive);

  const handleStartExam = (examId: string) => {
    if (!user) return;
    startExam(examId, user.id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available Exams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
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
          <BookOpen className="h-5 w-5" />
          Available Exams ({visibleExams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleExams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No exams available at the moment.</p>
            <p className="text-sm mt-2">Check back later for new exams.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleExams.map((exam) => {
              const status = getExamStatus(exam);
              return (
                <div key={exam.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{exam.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{exam.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={status.color}>{status.status}</Badge>
                        <Badge variant="outline">{exam.subject}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {exam.alwaysAvailable ? (
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            <span>Always Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            <span>{status.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exam.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {exam.totalPoints} pts
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleStartExam(exam.id)}
                      className="flex items-center gap-2"
                      disabled={!status.canStart}
                      variant={status.canStart ? "default" : "secondary"}
                    >
                      <Play className="h-4 w-4" />
                      {status.canStart ? 'Start Exam' : status.status === 'completed' ? 'Completed' : 'Not Available'}
                    </Button>
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

export default AvailableExams;
