
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import NightSeaBackground from './NightSeaBackground';
import LoginFormContent from './LoginFormContent';
import FeaturesSection from './FeaturesSection';
import SuccessStoriesCarousel from './SuccessStoriesCarousel';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const { isLoading } = useAuth();

  // Show loading overlay during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <NightSeaBackground />
      
      <LoginFormContent 
        onSwitchToRegister={onSwitchToRegister}
        onForgotPassword={onForgotPassword}
      />

      <FeaturesSection />

      <SuccessStoriesCarousel onSwitchToRegister={onSwitchToRegister} />
    </div>
  );
};

export default LoginForm;
