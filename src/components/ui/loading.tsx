
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  className, 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <div className={cn('animate-spin rounded-full border-4 border-slate-200 border-t-blue-600', sizeClasses[size])} />
      {text && (
        <p className="text-slate-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loading;
