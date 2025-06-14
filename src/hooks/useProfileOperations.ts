
import { supabase } from '../lib/supabase';
import type { User } from '../types/auth';

export const useProfileOperations = () => {
  const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar || undefined,
          department: profile.department || undefined,
          studentId: profile.student_id || undefined,
          emailConfirmed: true
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Updating profile for user:', userId, updates);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          department: updates.department,
          student_id: updates.studentId,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
      }

      console.log('Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const getAllProfiles = async (): Promise<User[]> => {
    try {
      console.log('Fetching all profiles');
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all profiles:', error);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar || undefined,
        department: profile.department || undefined,
        studentId: profile.student_id || undefined,
        emailConfirmed: true
      }));
    } catch (error) {
      console.error('Error in getAllProfiles:', error);
      return [];
    }
  };

  const getProfilesByRole = async (role: string): Promise<User[]> => {
    try {
      console.log('Fetching profiles by role:', role);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles by role:', error);
        return [];
      }

      return profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar || undefined,
        department: profile.department || undefined,
        studentId: profile.student_id || undefined,
        emailConfirmed: true
      }));
    } catch (error) {
      console.error('Error in getProfilesByRole:', error);
      return [];
    }
  };

  return {
    getUserProfile,
    updateUserProfile,
    getAllProfiles,
    getProfilesByRole
  };
};
