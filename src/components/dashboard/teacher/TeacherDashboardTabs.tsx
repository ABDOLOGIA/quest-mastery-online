
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import TeacherOverviewTab from './TeacherOverviewTab';
import TeacherExamsList from './TeacherExamsList';
import TeacherStudentsList from './TeacherStudentsList';
import TeacherResultsSection from '../TeacherResultsSection';
import QuestionManagement from '../../teacher/QuestionManagement';
import ExamCreationForm from '../../teacher/ExamCreationForm';

interface TeacherDashboardTabsProps {
  activeTab: string;
  onValueChange: (value: string) => void;
  stats: {
    studentCount: number;
    pendingGrading: number;
    myExamsCount: number;
    activeExamsCount: number;
  };
  isLoading: boolean;
  user: any;
  myExams: any[];
  allStudents: any[];
  refreshing: boolean;
  showExamForm: boolean;
  onShowExamForm: (show: boolean) => void;
  onRefresh: () => void;
  onExamCreated: () => void;
}

const TeacherDashboardTabs: React.FC<TeacherDashboardTabsProps> = ({
  activeTab,
  onValueChange,
  stats,
  isLoading,
  user,
  myExams,
  allStudents,
  refreshing,
  showExamForm,
  onShowExamForm,
  onRefresh,
  onExamCreated
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onValueChange}>
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="questions">Questions</TabsTrigger>
        <TabsTrigger value="exams">Exams</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="results">Results</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <TeacherOverviewTab
          stats={stats}
          isLoading={isLoading}
          user={user}
          onSetActiveTab={onValueChange}
        />
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
              onShowExamForm={onShowExamForm}
              onRefresh={onRefresh}
            />
            <ExamCreationForm 
              onExamCreated={onExamCreated} 
              onCancel={() => onShowExamForm(false)} 
            />
          </div>
        ) : (
          <TeacherExamsList
            exams={myExams}
            user={user}
            showExamForm={showExamForm}
            isLoading={isLoading}
            refreshing={refreshing}
            onShowExamForm={onShowExamForm}
            onRefresh={onRefresh}
          />
        )}
      </TabsContent>

      <TabsContent value="students" className="space-y-6">
        <TeacherStudentsList
          students={allStudents}
          refreshing={refreshing}
          isLoading={isLoading}
          onRefresh={onRefresh}
        />
      </TabsContent>

      <TabsContent value="results">
        <TeacherResultsSection />
      </TabsContent>
    </Tabs>
  );
};

export default TeacherDashboardTabs;
