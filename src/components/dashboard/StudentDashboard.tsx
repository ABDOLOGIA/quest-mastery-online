
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import AvailableExams from './AvailableExams';
import ExamResults from './ExamResults';
import SampleExamsGenerator from '../student/SampleExamsGenerator';
import HeroCarousel from '../home/HeroCarousel';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Clock, Trophy } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { exams, submittedExams } = useExam();

  const availableExams = exams.filter(exam => exam.isActive);
  const completedExams = submittedExams.length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600">
          Ready to take some exams? Check out what's available below.
        </p>
      </div>

      {/* Sample Exams Generator */}
      <SampleExamsGenerator />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Exams</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableExams.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to take
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedExams}</div>
            <p className="text-xs text-muted-foreground">
              Exams finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
            <p className="text-xs text-muted-foreground">
              In the system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Exams Section */}
      <AvailableExams />

      {/* Exam Results Section */}
      <ExamResults />

      {/* Hero Carousel Section */}
      <HeroCarousel />
    </div>
  );
};

export default StudentDashboard;
