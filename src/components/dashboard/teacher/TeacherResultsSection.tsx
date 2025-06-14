
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

const TeacherResultsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exam Results & Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Results and analytics will be displayed here.</p>
      </CardContent>
    </Card>
  );
};

export default TeacherResultsSection;
