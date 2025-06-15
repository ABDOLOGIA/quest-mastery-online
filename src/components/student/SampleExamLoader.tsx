
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { createStudentSampleExams } from '../../utils/exam/createStudentSampleExams';
import { BookOpen, Clock, Calendar, Infinity } from 'lucide-react';

interface SampleExamLoaderProps {
  onExamsCreated: () => void;
}

const SampleExamLoader: React.FC<SampleExamLoaderProps> = ({ onExamsCreated }) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSampleExams = async () => {
    setIsCreating(true);
    try {
      await createStudentSampleExams();
      
      toast({
        title: "Success!",
        description: "Sample exams have been created and are now available.",
      });
      
      onExamsCreated();
    } catch (error) {
      console.error('Error creating sample exams:', error);
      toast({
        title: "Error",
        description: "Failed to create sample exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Load Sample Exams
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          No exams are currently available. Click below to load some sample exams:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Infinity className="w-4 h-4 text-green-600" />
            <span><strong>General Knowledge:</strong> Always available</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <span><strong>Mathematics:</strong> Available now</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span><strong>Science:</strong> Starts tomorrow</span>
          </div>
        </div>

        <Button 
          onClick={handleCreateSampleExams} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Loading Sample Exams...' : 'Load Sample Exams'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleExamLoader;
