
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

interface SecurityWarningProps {
  showWarning: boolean;
  warningMessage: string;
  warningsCount: number;
  maxWarnings: number;
}

const SecurityWarning: React.FC<SecurityWarningProps> = ({
  showWarning,
  warningMessage,
  warningsCount,
  maxWarnings
}) => {
  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <Card className="w-96">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">🚨 Security Warning</h3>
          <p className="text-red-600 font-medium">{warningMessage}</p>
          <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-sm text-red-700">
              Warnings: {warningsCount}/{maxWarnings}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {maxWarnings - warningsCount} warnings remaining before exam termination
            </p>
          </div>
          <div className="mt-4 p-2 bg-blue-50 rounded">
            <p className="text-xs text-blue-700">
              ✅ Your progress has been auto-saved
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityWarning;
