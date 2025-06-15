
import React, { useState } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { createSampleExams } from '../../utils/exam/sampleExamData';
import { BookOpen, Plus, CheckCircle } from 'lucide-react';

const SampleExamAdder: React.FC = () => {
  const { user } = useAuth();
  const { createExam, exams } = useExam();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Check if sample exams already exist
  const sampleExamTitles = ['Mathematics Fundamentals', 'Physics Basics', 'English Language Skills'];
  const existingSampleExams = exams.filter(exam => 
    sampleExamTitles.includes(exam.title) && exam.createdBy === user?.id
  );

  console.log('Current exams:', exams);
  console.log('Existing sample exams:', existingSampleExams);
  console.log('User ID:', user?.id);

  const handleAddSampleExams = async () => {
    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "You must be logged in to create exams.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      console.log('Creating sample exams for user:', user.id);
      const sampleExams = createSampleExams(user.id);
      console.log('Sample exams to create:', sampleExams);
      
      let createdCount = 0;
      for (const examData of sampleExams) {
        // Only add if it doesn't already exist
        const exists = existingSampleExams.some(existing => existing.title === examData.title);
        if (!exists) {
          console.log('Creating exam:', examData.title);
          await createExam(examData);
          createdCount++;
        } else {
          console.log('Exam already exists:', examData.title);
        }
      }

      if (createdCount > 0) {
        toast({
          title: "Success!",
          description: `${createdCount} sample exam(s) have been added successfully.`,
        });
      } else {
        toast({
          title: "Info",
          description: "All sample exams already exist.",
        });
      }
    } catch (error) {
      console.error('Error adding sample exams:', error);
      toast({
        title: "Error",
        description: "Failed to add sample exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (existingSampleExams.length === sampleExamTitles.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Exams Already Added</h3>
          <p className="text-gray-600">
            You have already added all sample exams ({existingSampleExams.length}/{sampleExamTitles.length}).
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {existingSampleExams.map(exam => exam.title).join(', ')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Add Sample Exams
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Add pre-built sample exams to get started quickly. This will create:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li><strong>Mathematics Fundamentals</strong> - 45 minutes, 4 questions (40 points)</li>
          <li><strong>Physics Basics</strong> - 40 minutes, 4 questions (35 points)</li>
          <li><strong>English Language Skills</strong> - 30 minutes, 4 questions (30 points, always available)</li>
        </ul>
        <p className="text-sm text-gray-500">
          All exams include anti-cheating measures and auto-save functionality.
        </p>
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
          Current exams: {exams.length} | Sample exams found: {existingSampleExams.length}
        </div>
        <Button
          onClick={handleAddSampleExams}
          disabled={isAdding}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isAdding ? 'Adding Sample Exams...' : 'Add Sample Exams'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleExamAdder;
