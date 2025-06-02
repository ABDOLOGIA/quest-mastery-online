
import React, { useState } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import QuestionManagement from '../teacher/QuestionManagement';
import { 
  FileText, 
  Users, 
  Award, 
  PlusCircle,
  BarChart3,
  Clock,
  CheckCircle,
  Eye,
  ArrowLeft
} from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const { exams } = useExam();
  const [activeTab, setActiveTab] = useState('overview');

  const myExams = exams.filter(exam => exam.createdBy === '2'); // Current teacher ID

  const stats = [
    {
      title: 'My Exams',
      value: myExams.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Students',
      value: 142,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Grading',
      value: 8,
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Active Exams',
      value: myExams.filter(e => e.isActive).length,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
          <p className="text-gray-600">Manage your exams and track student progress.</p>
        </div>
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">My Exams</h3>
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Exam
            </Button>
          </div>

          {myExams.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No exams created yet</p>
                <Button className="mt-4">
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
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {exam.duration} minutes
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            23 students
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right space-y-2">
                        <Badge variant={exam.isActive ? "default" : "secondary"}>
                          {exam.isActive ? 'Active' : 'Inactive'}
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
