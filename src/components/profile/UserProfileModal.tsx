
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import type { User, UserRole } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { User as UserIcon, Mail, GraduationCap, Hash, AlertCircle, Check, Loader2, Briefcase, IdCard } from 'lucide-react';
import { toast } from '../ui/use-toast';

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
      
      // Try to get profile from backend first
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
        // If no backend profile but we have current user data, display that
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
        // Show success message
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        
        // Reload the user data to reflect changes
        await loadUserData();
        
        // Clear success message after 3 seconds
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
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
          <div className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={isEditing ? editForm.avatar : user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg bg-gray-200">
                  {getInitials(isEditing ? editForm.name : user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  {isEditing ? editForm.name : user.name}
                </h3>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user.role)}`}>
                  {getRoleDisplay(user.role)}
                </span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                  </div>

                  {user.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">Student ID</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="studentId"
                          value={editForm.studentId}
                          onChange={(e) => setEditForm(prev => ({ ...prev, studentId: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter student ID"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="department"
                        value={editForm.department}
                        onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter department"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar" className="text-sm font-medium text-gray-700">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={editForm.avatar}
                      onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                      placeholder="Enter avatar image URL"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">Full Name</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Hash className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 font-mono">{user.id}</p>
                      <p className="text-xs text-gray-500">User ID</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500">Email Address</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IdCard className="h-5 w-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{getRoleDisplay(user.role)}</p>
                      <p className="text-xs text-gray-500">Role</p>
                    </div>
                  </div>

                  {user.department && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.department}</p>
                        <p className="text-xs text-gray-500">Department</p>
                      </div>
                    </div>
                  )}

                  {user.role === 'student' && user.studentId && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user.studentId}</p>
                        <p className="text-xs text-gray-500">Student ID</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <div className="flex space-x-2 pt-4">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading || !editForm.name.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Edit Profile
                  </Button>
                )}
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
