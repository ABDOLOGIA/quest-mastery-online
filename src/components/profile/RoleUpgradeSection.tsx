
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { UserPlus, Crown, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import RoleRequestModal from '../admin/RoleRequestModal';

const RoleUpgradeSection: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-5 h-5" />;
      case 'teacher':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <UserPlus className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canRequestUpgrade = user?.role === 'student' || user?.role === 'teacher';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Role & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRoleIcon(user?.role || '')}
              <div>
                <p className="font-medium">Current Role</p>
                <Badge className={getRoleColor(user?.role || '')}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {canRequestUpgrade && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                Need additional permissions? Request a role upgrade to access more features.
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full"
                variant="outline"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Request Role Upgrade
              </Button>
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-green-600">
                You have full administrative access to the system.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Optionally refresh user data or show success message
        }}
      />
    </>
  );
};

export default RoleUpgradeSection;
