
import React from 'react';
import { Loader2 } from 'lucide-react';

interface FallbackLoadingProps {
  message?: string;
}

export const FallbackLoading: React.FC<FallbackLoadingProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-lg flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
        <p className="text-lg font-medium text-white">{message}</p>
        <p className="text-sm text-gray-300">If this takes too long, try refreshing the page</p>
      </div>
    </div>
  );
};

export default FallbackLoading;
