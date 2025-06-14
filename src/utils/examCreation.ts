
import type { Exam, Question } from '../types/exam';

export const generateSampleExams = (): Exam[] => {
  return [
    {
      id: 'mathematics-fundamentals',
      title: 'Mathematics Fundamentals',
      description: 'Basic mathematics concepts including algebra and geometry',
      subject: 'Mathematics',
      duration: 45,
      totalPoints: 100,
      isActive: true,
      createdBy: 'system',
      startTime: new Date(),
      endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      allowReview: true,
      shuffleQuestions: false,
      alwaysAvailable: true,
      questions: [
        {
          id: 'math-q1',
          question: 'Solve for x: 2x + 5 = 13',
          type: 'single-choice',
          options: ['x = 4', 'x = 6', 'x = 8', 'x = 9'],
          correctAnswer: 'x = 4',
          points: 25,
          category: 'Algebra',
          difficulty: 'easy'
        },
        {
          id: 'math-q2',
          question: 'What is the area of a rectangle with length 8 and width 5?',
          type: 'single-choice',
          options: ['35', '40', '45', '50'],
          correctAnswer: '40',
          points: 25,
          category: 'Geometry',
          difficulty: 'easy'
        },
        {
          id: 'math-q3',
          question: 'Complete the equation: 3² + 4² = ___',
          type: 'fill-blank',
          correctAnswer: '25',
          points: 25,
          category: 'Algebra',
          difficulty: 'medium'
        },
        {
          id: 'math-q4',
          question: 'Explain the Pythagorean theorem in your own words.',
          type: 'short-answer',
          correctAnswer: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.',
          points: 25,
          category: 'Geometry',
          difficulty: 'medium'
        }
      ]
    },
    {
      id: 'physics-basics',
      title: 'Physics Basics',
      description: 'Fundamental physics concepts and principles',
      subject: 'Physics',
      duration: 40,
      totalPoints: 100,
      isActive: true,
      createdBy: 'system',
      startTime: new Date(),
      endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      allowReview: true,
      shuffleQuestions: false,
      alwaysAvailable: true,
      questions: [
        {
          id: 'physics-q1',
          question: 'What is the unit of force in the SI system?',
          type: 'single-choice',
          options: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correctAnswer: 'Newton',
          points: 25,
          category: 'Mechanics',
          difficulty: 'easy'
        },
        {
          id: 'physics-q2',
          question: 'Which of the following are forms of energy? (Select all that apply)',
          type: 'multiple-choice',
          options: ['Kinetic', 'Potential', 'Thermal', 'Chemical'],
          correctAnswer: ['Kinetic', 'Potential', 'Thermal', 'Chemical'],
          points: 25,
          category: 'Energy',
          difficulty: 'medium'
        },
        {
          id: 'physics-q3',
          question: 'The speed of light in vacuum is approximately ___ m/s.',
          type: 'fill-blank',
          correctAnswer: '299792458',
          points: 25,
          category: 'Optics',
          difficulty: 'hard'
        },
        {
          id: 'physics-q4',
          question: 'Describe Newton\'s first law of motion.',
          type: 'short-answer',
          correctAnswer: 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
          points: 25,
          category: 'Mechanics',
          difficulty: 'medium'
        }
      ]
    },
    {
      id: 'english-language',
      title: 'English Language Skills',
      description: 'Grammar, vocabulary, and reading comprehension',
      subject: 'English',
      duration: 30,
      totalPoints: 100,
      isActive: true,
      createdBy: 'system',
      startTime: new Date(),
      endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      allowReview: true,
      shuffleQuestions: false,
      alwaysAvailable: true,
      questions: [
        {
          id: 'english-q1',
          question: 'Choose the correct form: "She ___ to the store yesterday."',
          type: 'single-choice',
          options: ['go', 'goes', 'went', 'going'],
          correctAnswer: 'went',
          points: 25,
          category: 'Grammar',
          difficulty: 'easy'
        },
        {
          id: 'english-q2',
          question: 'Which of the following are adjectives?',
          type: 'multiple-choice',
          options: ['Beautiful', 'Quickly', 'Tall', 'Run'],
          correctAnswer: ['Beautiful', 'Tall'],
          points: 25,
          category: 'Grammar',
          difficulty: 'medium'
        },
        {
          id: 'english-q3',
          question: 'Complete the sentence: The opposite of \'hot\' is ___.',
          type: 'fill-blank',
          correctAnswer: 'cold',
          points: 25,
          category: 'Vocabulary',
          difficulty: 'easy'
        },
        {
          id: 'english-q4',
          question: 'Write a brief summary of your favorite book.',
          type: 'short-answer',
          correctAnswer: 'Any coherent summary of a book showing understanding of plot and characters.',
          points: 25,
          category: 'Writing',
          difficulty: 'hard'
        }
      ]
    },
    {
      id: 'general-science-quiz',
      title: 'General Science Quiz',
      description: 'Mixed science topics covering biology, chemistry, and earth science',
      subject: 'Science',
      duration: 35,
      totalPoints: 100,
      isActive: true,
      createdBy: 'system',
      startTime: new Date(),
      endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      allowReview: true,
      shuffleQuestions: false,
      alwaysAvailable: true,
      questions: [
        {
          id: 'science-q1',
          question: 'What is the chemical symbol for water?',
          type: 'single-choice',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 'H2O',
          points: 25,
          category: 'Chemistry',
          difficulty: 'easy'
        },
        {
          id: 'science-q2',
          question: 'Which of these are parts of a plant cell?',
          type: 'multiple-choice',
          options: ['Cell wall', 'Chloroplasts', 'Nucleus', 'Mitochondria'],
          correctAnswer: ['Cell wall', 'Chloroplasts', 'Nucleus', 'Mitochondria'],
          points: 25,
          category: 'Biology',
          difficulty: 'medium'
        },
        {
          id: 'science-q3',
          question: 'The Earth\'s atmosphere is approximately ___% nitrogen.',
          type: 'fill-blank',
          correctAnswer: '78',
          points: 25,
          category: 'Earth Science',
          difficulty: 'medium'
        },
        {
          id: 'science-q4',
          question: 'Explain the process of photosynthesis briefly.',
          type: 'short-answer',
          correctAnswer: 'Plants use sunlight, carbon dioxide, and water to produce glucose and oxygen.',
          points: 25,
          category: 'Biology',
          difficulty: 'hard'
        }
      ]
    }
  ];
};

// Export the createExamInDatabase function from the exam/examCreation module
export { createExamInDatabase } from './exam/examCreation';
