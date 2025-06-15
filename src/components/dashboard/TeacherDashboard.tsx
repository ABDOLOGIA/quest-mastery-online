
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import QuestionManagement from '../teacher/QuestionManagement';
import ExamCreationForm from '../teacher/ExamCreationForm';
import SampleExamCreator from '../teacher/SampleExamCreator';
import { useToast } from '../ui/use-toast';
import { canCreateContent, canManageExams } from '../../utils/roleHelpers';
import { AlertCircle } from 'lucide-react';
import TeacherDashboardHeader from './teacher/TeacherDashboardHeader';
import TeacherDashboardStats from './TeacherDashboardStats';
import TeacherQuickActions from './teacher/TeacherQuickActions';
import TeacherExamsList from './teacher/TeacherExamsList';
import TeacherStudentsList from './teacher/TeacherStudentsList';
import TeacherResultsSection from './TeacherResultsSection';

interface TeacherStats {
  studentCount: number;
  pendingGrading: number;
  myExamsCount: number;
  activeExamsCount: number;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams, loadExams, isLoading, getAllStudents } = useExam();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<TeacherStats>({
    studentCount: 0,
    pendingGrading: 0,
    myExamsCount: 0,
    activeExamsCount: 0
  });
  const [showExamForm, setShowExamForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Check if user has permission to access teacher dashboard
  if (!canManageExams(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">You don't have permission to access the teacher dashboard. Only teachers and admins can access this area.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myExams = exams.filter(exam => exam.createdBy === user?.id);

  useEffect(() => {
    if (user) {
      loadTeacherStats();
      loadExams();
      loadAllStudents();
    }
  }, [user]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      myExamsCount: myExams.length,
      activeExamsCount: myExams.filter(e => e.isActive).length
    }));
  }, [myExams]);

  const loadAllStudents = async () => {
    try {
      const students = await getAllStudents();
      setAllStudents(students);
      setStats(prev => ({
        ...prev,
        studentCount: students.length
      }));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

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

  const loadTeacherStats = async () => {
    if (!user || !canManageExams(user)) return;

    try {
      // Get pending grading count
      const { data: pendingGradingData, error: gradingError } = await supabase
        .rpc('get_pending_grading_count', { teacher_id_param: user.id });

      if (gradingError) {
        console.error('Error fetching pending grading count:', gradingError);
      }

      setStats(prev => ({
        ...prev,
        pendingGrading: pendingGradingData || 0
      }));
    } catch (error) {
      console.error('Error loading teacher stats:', error);
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TeacherDashboardStats />
          <TeacherQuickActions user={user} onSetActiveTab={setActiveTab} />
          <SampleExamCreator />
        </TabsContent>

        <TabsContent value="questions">
          <QuestionManagement />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          {showExamForm ? (
            <div className="space-y-4">
              <TeacherExamsList
                exams={myExams}
                user={user}
                showExamForm={showExamForm}
                isLoading={isLoading}
                refreshing={refreshing}
                onShowExamForm={setShowExamForm}
                onRefresh={handleRefresh}
              />
              <ExamCreationForm onExamCreated={handleExamCreated} onCancel={() => setShowExamForm(false)} />
            </div>
          ) : (
            <TeacherExamsList
              exams={myExams}
              user={user}
              showExamForm={showExamForm}
              isLoading={isLoading}
              refreshing={refreshing}
              onShowExamForm={setShowExamForm}
              onRefresh={handleRefresh}
            />
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <TeacherStudentsList
            students={allStudents}
            refreshing={refreshing}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="results">
          <TeacherResultsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
