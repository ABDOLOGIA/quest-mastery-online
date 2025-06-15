
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardContent } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { canManageExams } from '../../utils/roleHelpers';
import { AlertCircle, BookOpen } from 'lucide-react';
import TeacherDashboardHeader from './teacher/TeacherDashboardHeader';
import TeacherDashboardTabs from './teacher/TeacherDashboardTabs';
import { useTeacherStats } from '../../hooks/useTeacherStats';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { loadExams, isLoading } = useExam();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [showExamForm, setShowExamForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    stats,
    allStudents,
    myExams,
    loadAllStudents,
    loadTeacherStats
  } = useTeacherStats();

  // Check if user has permission to access teacher dashboard
  if (!canManageExams(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Teacher Access Required</h3>
            <p className="text-gray-600">You need a teacher account to access this dashboard. Teachers can create and manage exams immediately.</p>
            <p className="text-sm text-gray-500 mt-2">
              Current role: <span className="font-medium">{user?.role || 'Not logged in'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      loadTeacherStats();
      loadExams();
      loadAllStudents();
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExams();
      await loadTeacherStats();
      await loadAllStudents();
      toast({
        title: "Refreshed",
        description: "Data has been updated.",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleExamCreated = async () => {
    try {
      setShowExamForm(false);
      await loadExams();
      await loadTeacherStats();
      
      toast({
        title: "Success!",
        description: "Exam created successfully and is now available.",
      });
    } catch (error) {
      console.error('Error after exam creation:', error);
      toast({
        title: "Error",
        description: "There was a problem refreshing the exam list.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <TeacherDashboardHeader
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isLoading={isLoading}
      />

      <TeacherDashboardTabs
        activeTab={activeTab}
        onValueChange={setActiveTab}
        stats={stats}
        isLoading={isLoading}
        user={user}
        myExams={myExams}
        allStudents={allStudents}
        refreshing={refreshing}
        showExamForm={showExamForm}
        onShowExamForm={setShowExamForm}
        onRefresh={handleRefresh}
        onExamCreated={handleExamCreated}
      />
    </div>
  );
};

export default TeacherDashboard;
