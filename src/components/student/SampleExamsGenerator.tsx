
import React from 'react';
import { useExam } from '../../contexts/ExamContext';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { BookOpen, Clock, Users, Award } from 'lucide-react';
import { generateSampleExams } from '../../utils/examCreation';

const SampleExamsGenerator: React.FC = () => {
  const { exams, setExams } = useExam();

  const handleGenerateExams = () => {
    const sampleExams = generateSampleExams();
    setExams([...exams, ...sampleExams]);
  };

  const hasSampleExams = exams.some(exam => 
    ['mathematics-fundamentals', 'physics-basics', 'english-language', 'general-science-quiz'].includes(exam.id)
  );

  if (hasSampleExams) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-700">
            <Award className="w-5 h-5" />
            <span className="font-medium">Sample exams are already available!</span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            You can find the sample exams in the "Available Exams" section above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700">
          <BookOpen className="w-5 h-5" />
          <span>Sample Exams</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-600 mb-4">
          Generate sample exams to practice with different subjects and question types.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Clock className="w-4 h-4" />
            <span>Timed exams with auto-save</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <Users className="w-4 h-4" />
            <span>Multiple question types</span>
          </div>
        </div>

        <Button 
          onClick={handleGenerateExams}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Sample Exams
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleExamsGenerator;
