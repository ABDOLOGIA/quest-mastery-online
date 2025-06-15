
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import { createSampleExams } from '../../utils/exam/sampleExams';
import { BookOpen, Clock, Calendar, Infinity } from 'lucide-react';

const SampleExamCreator: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSampleExams = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      await createSampleExams(user.id);
      
      toast({
        title: "Success!",
        description: "Sample exams created successfully with different availability settings.",
      });
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
          Sample Exams Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Create sample exams to test the system with different availability settings:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Infinity className="w-4 h-4 text-green-600" />
            <span><strong>Mathematics:</strong> Always available</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4 text-blue-600" />
            <span><strong>Physics:</strong> Available for 7 days</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span><strong>Chemistry:</strong> Starts in 2 days</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span><strong>English:</strong> Currently active</span>
          </div>
        </div>

        <Button 
          onClick={handleCreateSampleExams} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Creating Sample Exams...' : 'Create Sample Exams'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleExamCreator;
