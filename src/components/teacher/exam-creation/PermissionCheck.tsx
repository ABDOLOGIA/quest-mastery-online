
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { AlertCircle } from 'lucide-react';
import { User } from '../../../types/auth';
import { canCreateContent } from '../../../utils/roleHelpers';

interface PermissionCheckProps {
  user: User | null;
  children: React.ReactNode;
}

const PermissionCheck: React.FC<PermissionCheckProps> = ({ user, children }) => {
  if (!canCreateContent(user)) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to create exams. Only teachers and admins can create exams.</p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default PermissionCheck;
