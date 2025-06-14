
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center text-red-600 text-sm mt-1">
      <AlertCircle className="w-4 h-4 mr-1" />
      {error}
    </div>
  );
};

export default ErrorMessage;
