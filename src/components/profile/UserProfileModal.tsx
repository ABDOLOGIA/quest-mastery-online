
import React, { useState, useEffect } from 'react';
import { useExtendedAuth } from '../../contexts/ExtendedAuthContext';
import type { User } from '../../types/auth';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';
import UserProfileHeader from './UserProfileHeader';
import UserProfileInfo from './UserProfileInfo';
import UserProfileForm from './UserProfileForm';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  canEdit?: boolean;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  canEdit = false 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    studentId: '',
    avatar: ''
  });

  const { getUserProfile, updateUserProfile, user: currentUser } = useExtendedAuth();

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Loading user profile for modal, userId:', userId);
      
      // If this is the current user's profile, use the current user data first
      if (currentUser && currentUser.id === userId) {
        console.log('Using current user data:', currentUser);
        setUser(currentUser);
        setEditForm({
          name: currentUser.name,
          department: currentUser.department || '',
          studentId: currentUser.studentId || '',
          avatar: currentUser.avatar || ''
        });
      }
      
      // Still fetch from database to get the latest data
      const profile = await getUserProfile(userId);
      console.log('Profile fetched from database:', profile);
      
      if (profile) {
        setUser(profile);
        setEditForm({
          name: profile.name,
          department: profile.department || '',
          studentId: profile.studentId || '',
          avatar: profile.avatar || ''
        });
      } else if (!currentUser || currentUser.id !== userId) {
        // Only show error if it's not the current user's profile
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

    const result = await updateUserProfile(user.id, {
      name: editForm.name,
      department: editForm.department || undefined,
      studentId: editForm.studentId || undefined,
      avatar: editForm.avatar || undefined
    });

    if (result.success) {
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      // Reload the profile to get updated data
      await loadUserProfile();
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setIsLoading(false);
  };

  const handleCancel = () => {
    if (user) {
      setEditForm({
        name: user.name,
        department: user.department || '',
        studentId: user.studentId || '',
        avatar: user.avatar || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleRefresh = () => {
    loadUserProfile();
  };

  const handleFormChange = (updates: Partial<typeof editForm>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>User Profile</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {!isLoading && user && (
          <div className="space-y-6">
            <UserProfileHeader user={user} />

            <div className="space-y-4">
              {isEditing ? (
                <UserProfileForm
                  user={user}
                  editForm={editForm}
                  isLoading={isLoading}
                  onFormChange={handleFormChange}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <UserProfileInfo user={user} />
              )}
            </div>

            {/* Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {canEdit && !isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Profile
              </Button>
            )}
          </div>
        )}

        {!isLoading && !user && (
          <div className="text-center py-8">
            <p className="text-gray-500">User profile not found</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
