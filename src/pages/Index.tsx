
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useExam } from '../contexts/ExamContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ExamInterface from '../components/exam/ExamInterface';

const Index = () => {
  const { user } = useAuth();
  const { currentExam } = useExam();
  const [showRegister, setShowRegister] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Show exam interface if user is taking an exam
  if (user && currentExam) {
    return <ExamInterface />;
  }

  // Show auth forms if not logged in
  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  const renderMainContent = () => {
    if (activeSection === 'dashboard') {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'teacher':
          return <TeacherDashboard />;
        case 'student':
          return <StudentDashboard />;
        default:
          return <StudentDashboard />;
      }
    }

    // Placeholder for other sections
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h2>
          <p className="text-gray-600">This section is under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <main className="flex-1 p-6">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
