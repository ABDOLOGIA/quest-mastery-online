
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useExam } from '../../contexts/ExamContext';
import { Exam } from '../../types/exam';
import { BookOpen, Clock, Trophy, Play } from 'lucide-react';

const SampleExamsGenerator = () => {
  const { exams, setExams } = useExam();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSampleExams = () => {
    setIsGenerating(true);
    
    const sampleExams: Exam[] = [
      {
        id: 'exam-math-001',
        title: 'Mathematics Fundamentals',
        description: 'Test your knowledge of basic mathematical concepts including algebra, geometry, and statistics.',
        subject: 'Mathematics',
        duration: 45,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        totalPoints: 40,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: 'system',
        alwaysAvailable: true,
        questions: [
          {
            id: 'q1',
            type: 'single-choice',
            question: 'What is the value of x in the equation 2x + 5 = 15?',
            options: ['3', '5', '7', '10'],
            correctAnswer: '5',
            points: 10,
            category: 'Algebra',
            difficulty: 'easy'
          },
          {
            id: 'q2',
            type: 'single-choice',
            question: 'What is the area of a circle with radius 4?',
            options: ['8π', '12π', '16π', '20π'],
            correctAnswer: '16π',
            points: 10,
            category: 'Geometry',
            difficulty: 'medium'
          },
          {
            id: 'q3',
            type: 'fill-blank',
            question: 'The derivative of x² is ____',
            correctAnswer: '2x',
            points: 10,
            category: 'Calculus',
            difficulty: 'medium'
          },
          {
            id: 'q4',
            type: 'short-answer',
            question: 'Explain the Pythagorean theorem and provide an example.',
            correctAnswer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. Example: a² + b² = c²',
            points: 10,
            category: 'Geometry',
            difficulty: 'hard'
          }
        ]
      },
      {
        id: 'exam-physics-001',
        title: 'Physics Basics',
        description: 'Fundamental concepts in mechanics, thermodynamics, and electromagnetism.',
        subject: 'Physics',
        duration: 40,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalPoints: 40,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: 'system',
        alwaysAvailable: true,
        questions: [
          {
            id: 'q5',
            type: 'single-choice',
            question: 'What is Newton\'s first law of motion?',
            options: [
              'F = ma',
              'An object at rest stays at rest unless acted upon by a force',
              'For every action there is an equal and opposite reaction',
              'Energy cannot be created or destroyed'
            ],
            correctAnswer: 'An object at rest stays at rest unless acted upon by a force',
            points: 10,
            category: 'Mechanics',
            difficulty: 'easy'
          },
          {
            id: 'q6',
            type: 'single-choice',
            question: 'What is the speed of light in vacuum?',
            options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'],
            correctAnswer: '3 × 10⁸ m/s',
            points: 10,
            category: 'Electromagnetism',
            difficulty: 'medium'
          },
          {
            id: 'q7',
            type: 'fill-blank',
            question: 'The unit of electric current is ____',
            correctAnswer: 'Ampere',
            points: 10,
            category: 'Electromagnetism',
            difficulty: 'easy'
          },
          {
            id: 'q8',
            type: 'short-answer',
            question: 'Explain the concept of entropy in thermodynamics.',
            correctAnswer: 'Entropy is a measure of disorder or randomness in a system. It tends to increase in isolated systems according to the second law of thermodynamics.',
            points: 10,
            category: 'Thermodynamics',
            difficulty: 'hard'
          }
        ]
      },
      {
        id: 'exam-english-001',
        title: 'English Language Skills',
        description: 'Test your grammar, vocabulary, and reading comprehension skills.',
        subject: 'English',
        duration: 30,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalPoints: 40,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: 'system',
        alwaysAvailable: true,
        questions: [
          {
            id: 'q9',
            type: 'single-choice',
            question: 'Which of the following is a synonym for "abundant"?',
            options: ['Scarce', 'Plentiful', 'Limited', 'Rare'],
            correctAnswer: 'Plentiful',
            points: 10,
            category: 'Vocabulary',
            difficulty: 'easy'
          },
          {
            id: 'q10',
            type: 'multiple-choice',
            question: 'Which of the following are parts of speech? (Select all that apply)',
            options: ['Noun', 'Verb', 'Adjective', 'Sentence'],
            correctAnswer: ['Noun', 'Verb', 'Adjective'],
            points: 10,
            category: 'Grammar',
            difficulty: 'medium'
          },
          {
            id: 'q11',
            type: 'fill-blank',
            question: 'The past tense of "run" is ____',
            correctAnswer: 'ran',
            points: 10,
            category: 'Grammar',
            difficulty: 'easy'
          },
          {
            id: 'q12',
            type: 'short-answer',
            question: 'Write a brief summary of your favorite book in 2-3 sentences.',
            correctAnswer: 'Any coherent summary demonstrating reading comprehension and writing skills.',
            points: 10,
            category: 'Writing',
            difficulty: 'medium'
          }
        ]
      },
      {
        id: 'exam-science-001',
        title: 'General Science Quiz',
        description: 'Mixed questions covering biology, chemistry, and earth science.',
        subject: 'Science',
        duration: 35,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalPoints: 50,
        isActive: true,
        allowReview: true,
        shuffleQuestions: false,
        createdBy: 'system',
        alwaysAvailable: true,
        questions: [
          {
            id: 'q13',
            type: 'single-choice',
            question: 'What is the chemical symbol for water?',
            options: ['H2O', 'CO2', 'NaCl', 'O2'],
            correctAnswer: 'H2O',
            points: 10,
            category: 'Chemistry',
            difficulty: 'easy'
          },
          {
            id: 'q14',
            type: 'single-choice',
            question: 'Which organ pumps blood throughout the human body?',
            options: ['Lungs', 'Liver', 'Heart', 'Kidney'],
            correctAnswer: 'Heart',
            points: 10,
            category: 'Biology',
            difficulty: 'easy'
          },
          {
            id: 'q15',
            type: 'multiple-choice',
            question: 'Which of the following are greenhouse gases? (Select all that apply)',
            options: ['Carbon dioxide', 'Methane', 'Oxygen', 'Water vapor'],
            correctAnswer: ['Carbon dioxide', 'Methane', 'Water vapor'],
            points: 15,
            category: 'Earth Science',
            difficulty: 'medium'
          },
          {
            id: 'q16',
            type: 'fill-blank',
            question: 'The process by which plants make their own food is called ____',
            correctAnswer: 'photosynthesis',
            points: 10,
            category: 'Biology',
            difficulty: 'medium'
          },
          {
            id: 'q17',
            type: 'short-answer',
            question: 'Explain the water cycle in 2-3 sentences.',
            correctAnswer: 'The water cycle involves evaporation from oceans and lakes, condensation in clouds, and precipitation as rain or snow, which returns water to Earth\'s surface.',
            points: 5,
            category: 'Earth Science',
            difficulty: 'medium'
          }
        ]
      }
    ];

    // Add the sample exams to the existing exams
    setExams(prevExams => [...prevExams, ...sampleExams]);
    setIsGenerating(false);
  };

  const hasGeneratedExams = exams.some(exam => exam.createdBy === 'system');

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Sample Exams
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasGeneratedExams ? (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-4">
              Generate sample exams to practice and test the exam system with auto-save and anti-cheating features.
            </p>
            <Button 
              onClick={generateSampleExams}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Sample Exams'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-green-600 font-medium">✅ Sample exams have been generated!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.filter(exam => exam.createdBy === 'system').map(exam => (
                <div key={exam.id} className="p-3 border rounded-lg bg-green-50">
                  <h4 className="font-medium text-green-800">{exam.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-green-600 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exam.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {exam.totalPoints} pts
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {exam.questions.length} questions • Always available
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              🔒 Each exam includes auto-save every 15 seconds and comprehensive anti-cheating measures.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SampleExamsGenerator;
