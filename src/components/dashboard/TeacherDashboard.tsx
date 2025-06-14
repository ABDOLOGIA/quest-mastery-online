import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExam } from '../../contexts/ExamContext';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import QuestionManagement from '../teacher/QuestionManagement';
import ExamCreationForm from '../teacher/ExamCreationForm';
import { useToast } from '../ui/use-toast';
import { 
  FileText, 
  Users, 
  Award, 
  PlusCircle,
  BarChart3,
  Clock,
  CheckCircle,
  Eye,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface TeacherStats {
  studentCount: number;
  pendingGrading: number;
  myExamsCount: number;
  activeExamsCount: number;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams, loadExams, isLoading } = useExam();
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

  const myExams = exams.filter(exam => exam.createdBy === user?.id);

  useEffect(() => {
    if (user) {
      loadTeacherStats();
      loadExams();
    }
  }, [user]);

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      myExamsCount: myExams.length,
      activeExamsCount: myExams.filter(e => e.isActive).length
    }));
  }, [myExams]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadExams();
      await loadTeacherStats();
      toast({
        title: "Refreshed",
        description: "Exam data has been updated.",
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
    if (!user || user.role !== 'teacher') return;

    try {
      // Get student count for this teacher
      const { data: studentCountData, error: studentError } = await supabase
        .rpc('get_teacher_student_count', { teacher_id_param: user.id });

      // Get pending grading count
      const { data: pendingGradingData, error: gradingError } = await supabase
        .rpc('get_pending_grading_count', { teacher_id_param: user.id });

      if (studentError) {
        console.error('Error fetching student count:', studentError);
      }

      if (gradingError) {
        console.error('Error fetching pending grading count:', gradingError);
      }

      setStats(prev => ({
        ...prev,
        studentCount: studentCountData || 0,
        pendingGrading: pendingGradingData || 0
      }));
    } catch (error) {
      console.error('Error loading teacher stats:', error);
    }
  };

  const statsData = [
    {
      title: 'My Exams',
      value: stats.myExamsCount,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Students',
      value: stats.studentCount,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Grading',
      value: stats.pendingGrading,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Exams',
      value: stats.activeExamsCount,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-gray-600">Manage your exams and track student progress.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('questions')}>
              <CardContent className="p-6 text-center">
                <PlusCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Manage Questions</h3>
                <p className="text-gray-600 text-sm">Create and organize exam questions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('exams')}>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Create Exam</h3>
                <p className="text-gray-600 text-sm">Design a new examination</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('results')}>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">View Results</h3>
                <p className="text-gray-600 text-sm">Analyze student performance</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <QuestionManagement />
        </TabsContent>

        <TabsContent value="exams" className="space-y-6">
          {showExamForm ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => setShowExamForm(false)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Exams
                </Button>
              </div>
              <ExamCreationForm onExamCreated={handleExamCreated} onCancel={() => setShowExamForm(false)} />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">My Exams ({myExams.length})</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleRefresh} disabled={refreshing || isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button onClick={() => setShowExamForm(true)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Exam
                  </Button>
                </div>
              </div>

              {isLoading || refreshing ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-500">Loading exams...</p>
                  </CardContent>
                </Card>
              ) : myExams.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No exams created yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first exam to get started</p>
                    <Button className="mt-4" onClick={() => setShowExamForm(true)}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Your First Exam
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myExams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                            <p className="text-gray-600 mt-1">{exam.description}</p>
                            <p className="text-sm text-blue-600 font-medium mt-1">Subject: {exam.subject}</p>
                            <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {exam.duration} minutes
                              </div>
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {exam.questions.length} questions
                              </div>
                              <div className="flex items-center">
                                <Award className="w-4 h-4 mr-1" />
                                {exam.totalPoints} points
                              </div>
                            </div>
                            {exam.alwaysAvailable ? (
                              <p className="text-xs text-green-600 font-medium mt-2">
                                ✓ Always available
                              </p>
                            ) : (
                              <p className="text-xs text-gray-500 mt-2">
                                Available: {new Date(exam.startTime).toLocaleString()} - {new Date(exam.endTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="ml-4 text-right space-y-2">
                            <Badge variant={exam.isActive ? "default" : "secondary"}>
                              {exam.isActive ? 'Published' : 'Draft'}
                            </Badge>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <BarChart3 className="w-4 h-4 mr-1" />
                                Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Exam Results & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Results and analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherDashboard;
