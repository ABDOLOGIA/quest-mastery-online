
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import type { RoleRequest, RoleRequestForm } from '../types/roles';

export const useRoleManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const submitRoleRequest = async (requestData: RoleRequestForm): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('Submitting role request:', requestData);
      
      const { error } = await supabase
        .from('role_requests')
        .insert({
          requested_role: requestData.requested_role,
          reason: requestData.reason
        });

      if (error) {
        console.error('Error submitting role request:', error);
        return { success: false, error: error.message };
      }

      toast({
        title: "Request Submitted",
        description: "Your role upgrade request has been submitted for review.",
      });

      return { success: true };
    } catch (error) {
      console.error('Error in submitRoleRequest:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleRequests = async (): Promise<RoleRequest[]> => {
    try {
      console.log('Fetching role requests');
      
      const { data, error } = await supabase
        .from('role_requests')
        .select(`
          *,
          user:profiles!role_requests_user_id_fkey(name, email, role),
          reviewer:profiles!role_requests_reviewed_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching role requests:', error);
        return [];
      }

      return data.map(request => ({
        id: request.id,
        user_id: request.user_id,
        requested_role: request.requested_role as 'teacher' | 'admin',
        status: request.status as 'pending' | 'approved' | 'rejected',
        reason: request.reason,
        reviewed_by: request.reviewed_by,
        reviewed_at: request.reviewed_at,
        created_at: request.created_at,
        user: request.user ? {
          name: request.user.name,
          email: request.user.email,
          current_role: request.user.role
        } : undefined,
        reviewer: request.reviewer ? {
          name: request.reviewer.name,
          email: request.reviewer.email
        } : undefined
      }));
    } catch (error) {
      console.error('Error in getRoleRequests:', error);
      return [];
    }
  };

  const approveRoleRequest = async (requestId: string, approve: boolean): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      console.log('Processing role request:', requestId, approve);
      
      const { data, error } = await supabase.rpc('approve_role_request', {
        request_id: requestId,
        approve: approve
      });

      if (error) {
        console.error('Error processing role request:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Failed to process request' };
      }

      toast({
        title: approve ? "Request Approved" : "Request Rejected",
        description: `Role request has been ${approve ? 'approved' : 'rejected'}.`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in approveRoleRequest:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUserRole = async (userId: string, requiredRole: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('verify_user_role', {
        user_id: userId,
        required_role: requiredRole
      });

      if (error) {
        console.error('Error verifying user role:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in verifyUserRole:', error);
      return false;
    }
  };

  return {
    submitRoleRequest,
    getRoleRequests,
    approveRoleRequest,
    verifyUserRole,
    isLoading
  };
};
