
import React from 'react';
import TeacherDashboardStats from './TeacherDashboardStats';
import TeacherQuickActions from './TeacherQuickActions';
import SampleExamAdder from '../../teacher/SampleExamAdder';

interface TeacherOverviewTabProps {
  stats: {
    studentCount: number;
    pendingGrading: number;
    myExamsCount: number;
    activeExamsCount: number;
  };
  isLoading: boolean;
  user: any;
  onSetActiveTab: (tab: string) => void;
}

const TeacherOverviewTab: React.FC<TeacherOverviewTabProps> = ({
  stats,
  isLoading,
  user,
  onSetActiveTab
}) => {
  return (
    <div className="space-y-6">
      <TeacherDashboardStats stats={stats} isLoading={isLoading} />
      <TeacherQuickActions user={user} onSetActiveTab={onSetActiveTab} />
      <SampleExamAdder />
    </div>
  );
};

export default TeacherOverviewTab;
