
import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { AlertCircle, Shield } from 'lucide-react';
import { User } from '../../../types/auth';
import { hasTeacherPermissions } from '../../../utils/roleHelpers';

interface PermissionCheckProps {
  user: User | null;
  children: React.ReactNode;
}

const PermissionCheck: React.FC<PermissionCheckProps> = ({ user, children }) => {
  if (!hasTeacherPermissions(user)) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Teacher Access Required</h3>
          <p className="text-gray-600 mb-4">
            You need teacher privileges to create and manage exams. Only teachers and admins can access this feature.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 mb-1">Need teacher access?</h4>
                <p className="text-sm text-blue-700">
                  Contact your administrator to upgrade your account to teacher status, or request a role upgrade from your profile settings.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Current role: <span className="font-medium">{user?.role || 'Not logged in'}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default PermissionCheck;
