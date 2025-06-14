
import React, { useState, useEffect } from 'react';
import { useProfileOperations } from '../../hooks/useProfileOperations';
import type { User, UserRole } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { User as UserIcon, Mail, GraduationCap, Building, AlertCircle, Check, Loader2 } from 'lucide-react';

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

  const { getUserProfile, updateUserProfile } = useProfileOperations();

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile();
    }
  }, [isOpen, userId]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        setUser(profile);
        setEditForm({
          name: profile.name,
          department: profile.department || '',
          studentId: profile.studentId || '',
          avatar: profile.avatar || ''
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
          </div>
        )}

        {!isLoading && user && (
          <div className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {getRoleDisplay(user.role)}
                </span>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="pl-10"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>

                  {user.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="department"
                          value={editForm.department}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          className="pl-10"
                          placeholder="Enter department"
                        />
                      </div>
                    </div>
                  )}

                  {user.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
                    <Label htmlFor="avatar">Avatar URL</Label>
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
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>

                  {user.department && (
                    <div className="flex items-center space-x-3">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.department}</span>
                    </div>
                  )}

                  {user.studentId && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Student ID: {user.studentId}</span>
                    </div>
                  )}
                </div>
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
            {canEdit && (
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex-1"
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
                    className="w-full"
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
            <p className="text-gray-500">User profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
