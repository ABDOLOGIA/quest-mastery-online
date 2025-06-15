
import { Exam, Question } from '../../types/exam';

export const createSampleExams = (teacherId: string): Omit<Exam, 'id'>[] => {
  const mathQuestions: Question[] = [
    {
      id: 'math-q1',
      type: 'single-choice',
      question: 'What is the result of 15 + 27?',
      options: ['40', '42', '44', '46'],
      correctAnswer: '42',
      points: 5,
      category: 'Arithmetic',
      difficulty: 'easy'
    },
    {
      id: 'math-q2',
      type: 'single-choice',
      question: 'Solve for x: 2x + 8 = 16',
      options: ['2', '4', '6', '8'],
      correctAnswer: '4',
      points: 10,
      category: 'Algebra',
      difficulty: 'medium'
    },
    {
      id: 'math-q3',
      type: 'single-choice',
      question: 'What is the area of a circle with radius 5?',
      options: ['25π', '10π', '15π', '20π'],
      correctAnswer: '25π',
      points: 10,
      category: 'Geometry',
      difficulty: 'medium'
    },
    {
      id: 'math-q4',
      type: 'short-answer',
      question: 'Calculate the derivative of f(x) = 3x² + 2x - 1',
      correctAnswer: '6x + 2',
      points: 15,
      category: 'Calculus',
      difficulty: 'hard'
    }
  ];

  const physicsQuestions: Question[] = [
    {
      id: 'phys-q1',
      type: 'single-choice',
      question: 'What is the acceleration due to gravity on Earth?',
      options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '11 m/s²'],
      correctAnswer: '9.8 m/s²',
      points: 5,
      category: 'Mechanics',
      difficulty: 'easy'
    },
    {
      id: 'phys-q2',
      type: 'multiple-choice',
      question: 'Which of the following are fundamental forces in nature?',
      options: ['Gravitational', 'Electromagnetic', 'Strong Nuclear', 'Weak Nuclear'],
      correctAnswer: ['Gravitational', 'Electromagnetic', 'Strong Nuclear', 'Weak Nuclear'],
      points: 10,
      category: 'Forces',
      difficulty: 'medium'
    },
    {
      id: 'phys-q3',
      type: 'fill-blank',
      question: 'The speed of light in vacuum is approximately ______ m/s.',
      correctAnswer: '3×10⁸',
      points: 8,
      category: 'Optics',
      difficulty: 'medium'
    },
    {
      id: 'phys-q4',
      type: 'short-answer',
      question: 'Explain Newton\'s First Law of Motion in your own words.',
      correctAnswer: 'An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force',
      points: 12,
      category: 'Laws of Motion',
      difficulty: 'medium'
    }
  ];

  const englishQuestions: Question[] = [
    {
      id: 'eng-q1',
      type: 'single-choice',
      question: 'Choose the correct form of the verb: "She _____ to the store yesterday."',
      options: ['go', 'goes', 'went', 'gone'],
      correctAnswer: 'went',
      points: 5,
      category: 'Grammar',
      difficulty: 'easy'
    },
    {
      id: 'eng-q2',
      type: 'multiple-choice',
      question: 'Which of the following are parts of speech?',
      options: ['Noun', 'Verb', 'Adjective', 'Preposition'],
      correctAnswer: ['Noun', 'Verb', 'Adjective', 'Preposition'],
      points: 8,
      category: 'Grammar',
      difficulty: 'easy'
    },
    {
      id: 'eng-q3',
      type: 'fill-blank',
      question: 'Complete the sentence: "The quick brown fox _____ over the lazy dog."',
      correctAnswer: 'jumps',
      points: 5,
      category: 'Vocabulary',
      difficulty: 'easy'
    },
    {
      id: 'eng-q4',
      type: 'short-answer',
      question: 'Write a brief summary (2-3 sentences) about the importance of reading.',
      correctAnswer: 'Reading is essential for expanding knowledge and vocabulary. It improves comprehension skills and critical thinking abilities.',
      points: 12,
      category: 'Writing',
      difficulty: 'medium'
    }
  ];

  return [
    {
      title: 'Mathematics Fundamentals',
      description: 'A comprehensive test covering basic mathematics including arithmetic, algebra, geometry, and calculus.',
      subject: 'Mathematics',
      questions: mathQuestions,
      duration: 45,
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      totalPoints: mathQuestions.reduce((sum, q) => sum + q.points, 0),
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: teacherId,
      alwaysAvailable: false
    },
    {
      title: 'Physics Basics',
      description: 'Test your understanding of fundamental physics concepts including mechanics, forces, and motion.',
      subject: 'Physics',
      questions: physicsQuestions,
      duration: 40,
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      totalPoints: physicsQuestions.reduce((sum, q) => sum + q.points, 0),
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: teacherId,
      alwaysAvailable: false
    },
    {
      title: 'English Language Skills',
      description: 'Always available practice exam for English grammar, vocabulary, and writing skills.',
      subject: 'English',
      questions: englishQuestions,
      duration: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      totalPoints: englishQuestions.reduce((sum, q) => sum + q.points, 0),
      isActive: true,
      allowReview: true,
      shuffleQuestions: false,
      createdBy: teacherId,
      alwaysAvailable: true
    }
  ];
};
