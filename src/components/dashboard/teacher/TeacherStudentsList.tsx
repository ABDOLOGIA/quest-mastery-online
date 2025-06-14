
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Users, RefreshCw } from 'lucide-react';

interface TeacherStudentsListProps {
  students: any[];
  refreshing: boolean;
  isLoading: boolean;
  onRefresh: () => void;
}

const TeacherStudentsList: React.FC<TeacherStudentsListProps> = ({
  students,
  refreshing,
  isLoading,
  onRefresh
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            All Students ({students.length})
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    {student.student_id && (
                      <p className="text-sm text-blue-600">ID: {student.student_id}</p>
                    )}
                    {student.department && (
                      <p className="text-sm text-gray-500">Department: {student.department}</p>
                    )}
                  </div>
                  <Badge variant="secondary">Student</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherStudentsList;
