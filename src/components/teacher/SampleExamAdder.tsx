
import React, { useState } from 'react';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { BookOpen, Plus, CheckCircle, Loader2 } from 'lucide-react';

const SampleExamAdder: React.FC = () => {
  const { user } = useAuth();
  const { createExam, exams } = useExam();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const createSampleExams = () => {
    if (!user) return [];

    return [
      {
        title: 'Mathematics Fundamentals',
        description: 'Test your understanding of basic mathematical concepts including algebra, geometry, and arithmetic.',
        subject: 'Mathematics',
        duration: 45,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalPoints: 40,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: user.id,
        alwaysAvailable: false,
        questions: [
          {
            id: 'math-q1',
            type: 'single-choice' as const,
            question: 'What is the value of 2x + 5 when x = 3?',
            options: ['8', '11', '13', '16'],
            correctAnswer: '11',
            points: 10,
            category: 'Algebra',
            difficulty: 'medium' as const
          },
          {
            id: 'math-q2',
            type: 'single-choice' as const,
            question: 'Which of the following is a prime number?',
            options: ['15', '21', '17', '25'],
            correctAnswer: '17',
            points: 10,
            category: 'Number Theory',
            difficulty: 'easy' as const
          },
          {
            id: 'math-q3',
            type: 'fill-blank' as const,
            question: 'The area of a rectangle with length 8 units and width 5 units is _____ square units.',
            correctAnswer: '40',
            points: 10,
            category: 'Geometry',
            difficulty: 'easy' as const
          },
          {
            id: 'math-q4',
            type: 'short-answer' as const,
            question: 'Explain the Pythagorean theorem and provide an example of its application.',
            correctAnswer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides (a² + b² = c²).',
            points: 10,
            category: 'Geometry',
            difficulty: 'medium' as const
          }
        ]
      },
      {
        title: 'Physics Basics',
        description: 'Fundamental concepts in physics including motion, energy, and forces.',
        subject: 'Physics',
        duration: 40,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalPoints: 35,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: user.id,
        alwaysAvailable: false,
        questions: [
          {
            id: 'physics-q1',
            type: 'single-choice' as const,
            question: 'What is the unit of force in the SI system?',
            options: ['Joule', 'Newton', 'Watt', 'Pascal'],
            correctAnswer: 'Newton',
            points: 8,
            category: 'Mechanics',
            difficulty: 'easy' as const
          },
          {
            id: 'physics-q2',
            type: 'multiple-choice' as const,
            question: 'Which of the following are forms of energy? (Select all that apply)',
            options: ['Kinetic', 'Potential', 'Thermal', 'Chemical'],
            correctAnswer: ['Kinetic', 'Potential', 'Thermal', 'Chemical'],
            points: 12,
            category: 'Energy',
            difficulty: 'medium' as const
          },
          {
            id: 'physics-q3',
            type: 'fill-blank' as const,
            question: 'The acceleration due to gravity on Earth is approximately _____ m/s².',
            correctAnswer: '9.8',
            points: 7,
            category: 'Mechanics',
            difficulty: 'easy' as const
          },
          {
            id: 'physics-q4',
            type: 'short-answer' as const,
            question: 'Describe Newton\'s first law of motion and provide a real-world example.',
            correctAnswer: 'Newton\'s first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
            points: 8,
            category: 'Mechanics',
            difficulty: 'medium' as const
          }
        ]
      },
      {
        title: 'English Language Skills',
        description: 'Assessment of grammar, vocabulary, and reading comprehension skills.',
        subject: 'English',
        duration: 30,
        startTime: new Date(),
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        totalPoints: 30,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: user.id,
        alwaysAvailable: true, // This exam is always available
        questions: [
          {
            id: 'english-q1',
            type: 'single-choice' as const,
            question: 'Which sentence is grammatically correct?',
            options: [
              'She don\'t like coffee.',
              'She doesn\'t likes coffee.',
              'She doesn\'t like coffee.',
              'She not like coffee.'
            ],
            correctAnswer: 'She doesn\'t like coffee.',
            points: 8,
            category: 'Grammar',
            difficulty: 'easy' as const
          },
          {
            id: 'english-q2',
            type: 'single-choice' as const,
            question: 'What is the synonym of "enormous"?',
            options: ['Tiny', 'Huge', 'Medium', 'Small'],
            correctAnswer: 'Huge',
            points: 7,
            category: 'Vocabulary',
            difficulty: 'easy' as const
          },
          {
            id: 'english-q3',
            type: 'fill-blank' as const,
            question: 'The past tense of "write" is _____.',
            correctAnswer: 'wrote',
            points: 7,
            category: 'Grammar',
            difficulty: 'easy' as const
          },
          {
            id: 'english-q4',
            type: 'short-answer' as const,
            question: 'Write a brief paragraph (3-4 sentences) about your favorite hobby.',
            correctAnswer: 'Sample answer about a hobby with proper grammar and sentence structure.',
            points: 8,
            category: 'Writing',
            difficulty: 'medium' as const
          }
        ]
      }
    ];
  };

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
      const sampleExams = createSampleExams();
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
          description: `${createdCount} sample exam(s) have been added successfully. Students can now take these exams with auto-save and anti-cheating features.`,
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
          <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
            <p className="font-medium">✅ Features included in all exams:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auto-save every 15 seconds</li>
              <li>Anti-cheating monitoring (tab switching, copy/paste detection)</li>
              <li>Real-time timer with warnings</li>
              <li>Question flagging and navigation</li>
              <li>Security violation tracking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="w-5 h-5 mr-2" />
          Add Sample Exams with Security Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Add pre-built sample exams with comprehensive security and auto-save features:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li><strong>Mathematics Fundamentals</strong> - 45 minutes, 4 questions (40 points)</li>
          <li><strong>Physics Basics</strong> - 40 minutes, 4 questions (35 points)</li>
          <li><strong>English Language Skills</strong> - 30 minutes, 4 questions (30 points, always available)</li>
        </ul>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-2">🔒 Security Features Included:</p>
          <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
            <li>Auto-save progress every 15 seconds</li>
            <li>Tab switching detection and warnings</li>
            <li>Copy/paste prevention and monitoring</li>
            <li>Keyboard shortcut blocking (F12, Ctrl+C, etc.)</li>
            <li>Window focus loss detection</li>
            <li>Automatic exam termination after 3 warnings</li>
            <li>Real-time timer with countdown warnings</li>
          </ul>
        </div>

        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
          Current exams: {exams.length} | Sample exams found: {existingSampleExams.length}
        </div>
        
        <Button
          onClick={handleAddSampleExams}
          disabled={isAdding}
          className="w-full"
        >
          {isAdding ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Sample Exams...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add Sample Exams with Security Features
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleExamAdder;
