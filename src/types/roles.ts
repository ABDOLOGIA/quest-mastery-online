
export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  user?: {
    name: string;
    email: string;
    current_role: string;
  };
  reviewer?: {
    name: string;
    email: string;
  };
}

export interface RoleRequestForm {
  requested_role: 'teacher' | 'admin';
  reason: string;
}
