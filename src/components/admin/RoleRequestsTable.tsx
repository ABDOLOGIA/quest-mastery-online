
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Clock, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import type { RoleRequest } from '../../types/roles';

const RoleRequestsTable: React.FC = () => {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { getRoleRequests, approveRoleRequest, isLoading: processingRequest } = useRoleManagement();

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getRoleRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading role requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadRequests();
    }
  }, [user]);

  const handleApprove = async (requestId: string) => {
    const result = await approveRoleRequest(requestId, true);
    if (result.success) {
      await loadRequests();
    }
  };

  const handleReject = async (requestId: string) => {
    const result = await approveRoleRequest(requestId, false);
    if (result.success) {
      await loadRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      teacher: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    };
    return <Badge variant="secondary" className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  if (user?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can view role requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Role Upgrade Requests
          </CardTitle>
          <Button variant="outline" size="sm" onClick={loadRequests} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No role requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{request.user?.name || 'Unknown User'}</h4>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{request.user?.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">Current role:</span>
                      {getRoleBadge(request.user?.current_role || 'unknown')}
                      <span className="text-gray-400">→</span>
                      <span className="text-sm text-gray-600">Requested:</span>
                      {getRoleBadge(request.requested_role)}
                    </div>
                    {request.reason && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.reviewed_at && request.reviewer && (
                        <span>Reviewed by: {request.reviewer.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getStatusBadge(request.status)}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          disabled={processingRequest}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                          disabled={processingRequest}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleRequestsTable;
