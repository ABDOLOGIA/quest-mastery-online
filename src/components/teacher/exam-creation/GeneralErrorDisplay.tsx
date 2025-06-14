
import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface GeneralErrorDisplayProps {
  error?: string;
  onRetry: () => void;
  isSubmitting: boolean;
}

const GeneralErrorDisplay: React.FC<GeneralErrorDisplayProps> = ({
  error,
  onRetry,
  isSubmitting
}) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <h4 className="text-red-800 font-medium">Creation Failed</h4>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isSubmitting}
            className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
          >
            <Loader2 className={`w-4 h-4 mr-2 ${isSubmitting ? 'animate-spin' : ''}`} />
            Retry Submission
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralErrorDisplay;
