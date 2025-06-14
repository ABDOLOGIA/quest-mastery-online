
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import type { User } from '../../types/auth';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { User as UserIcon, AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from '../ui/use-toast';
import ProfileAvatar from './ProfileAvatar';
import ProfileInfo from './ProfileInfo';
import ProfileEditForm from './ProfileEditForm';
import ProfileActions from './ProfileActions';
import RoleUpgradeSection from './RoleUpgradeSection';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  canEdit?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  canEdit = false 
}) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editForm, setEditForm] = useState({
    name: '',
    studentId: '',
    avatar: '',
    department: ''
  });

  const { getUserProfile, updateUserProfile } = useProfileOperations();

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, userId, currentUser]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError('');
    setUser(null);
    
    try {
      const targetUserId = userId || currentUser?.id;
      
      if (!targetUserId) {
        setError('No user ID available');
        setIsLoading(false);
        return;
      }

      console.log('Loading profile for userId:', targetUserId);
      
      const profile = await getUserProfile(targetUserId);
      console.log('Profile from backend:', profile);
      
      if (profile) {
        setUser(profile);
        setEditForm({
          name: profile.name,
          studentId: profile.studentId || '',
          avatar: profile.avatar || '',
          department: profile.department || ''
        });
      } else if (currentUser && targetUserId === currentUser.id) {
        console.log('Using current user data:', currentUser);
        setUser(currentUser);
        setEditForm({
          name: currentUser.name,
          studentId: currentUser.studentId || '',
          avatar: currentUser.avatar || '',
          department: currentUser.department || ''
        });
      } else {
        setError('User profile not found');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile');
    }
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Saving profile updates:', editForm);
      
      const result = await updateUserProfile(user.id, {
        name: editForm.name.trim(),
        studentId: editForm.studentId.trim() || undefined,
        avatar: editForm.avatar.trim() || undefined,
        department: editForm.department.trim() || undefined
      });

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        
        await loadUserData();
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        const errorMessage = result.error || 'Failed to update profile';
        setError(errorMessage);
        toast({
          title: "Update Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = 'An unexpected error occurred while updating your profile';
      setError(errorMessage);
      toast({
        title: "Update Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name,
        studentId: user.studentId || '',
        avatar: user.avatar || '',
        department: user.department || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const isOwnProfile = user?.id === currentUser?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">
              {isEditing ? 'Saving profile...' : 'Loading profile...'}
            </span>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="text-red-600 font-medium">{error}</p>
                <button 
                  onClick={loadUserData}
                  className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <ProfileAvatar user={user} editForm={editForm} isEditing={isEditing} />

              <div className="space-y-4">
                {isEditing ? (
                  <ProfileEditForm user={user} editForm={editForm} setEditForm={setEditForm} />
                ) : (
                  <ProfileInfo user={user} />
                )}
              </div>

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <Check className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <ProfileActions
                canEdit={canEdit}
                isEditing={isEditing}
                isLoading={isLoading}
                editFormValid={!!editForm.name.trim()}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>

            {/* Right Column - Role Management */}
            {isOwnProfile && (
              <div className="space-y-6">
                <RoleUpgradeSection />
              </div>
            )}
          </div>
        )}

        {!isLoading && !user && (
          <div className="text-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">User profile not found</p>
                <p className="text-gray-500 text-sm">The requested user profile could not be loaded.</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
