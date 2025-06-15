import { supabase } from '../lib/supabase';
import { Exam } from '../types/exam';

export const createExamInDatabase = async (examData: Omit<Exam, 'id'>, user: any) => {
  console.log('Creating exam in database with data:', examData);
  console.log('User creating exam:', user);

  if (!user || !user.id) {
    throw new Error('User must be authenticated to create exams');
  }

  try {
    // First, create or get the subject
    let subjectId: string;
    
    const { data: existingSubject, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', examData.subject)
      .maybeSingle();

    if (existingSubject) {
      subjectId = existingSubject.id;
      console.log('Using existing subject:', subjectId);
    } else {
      const { data: newSubject, error: createSubjectError } = await supabase
        .from('subjects')
        .insert({
          name: examData.subject,
          description: `Subject for ${examData.subject} exams`,
          created_by: user.id
        })
        .select('id')
        .single();

      if (createSubjectError) {
        console.error('Error creating subject:', createSubjectError);
        throw new Error(`Failed to create subject: ${createSubjectError.message}`);
      }

      subjectId = newSubject.id;
      console.log('Created new subject:', subjectId);
    }

    // Create the exam
    const examToInsert = {
      title: examData.title,
      description: examData.description,
      subject_id: subjectId,
      duration_minutes: examData.duration,
      start_time: examData.alwaysAvailable ? null : examData.startTime.toISOString(),
      end_time: examData.alwaysAvailable ? null : examData.endTime.toISOString(),
      total_marks: examData.totalPoints,
      is_published: examData.isActive,
      teacher_id: user.id,
      status: 'published'
    };

    console.log('Inserting exam:', examToInsert);

    const { data: examResult, error: examError } = await supabase
      .from('exams')
      .insert(examToInsert)
      .select('id')
      .single();

    if (examError) {
      console.error('Error creating exam:', examError);
      throw new Error(`Failed to create exam: ${examError.message}`);
    }

    const examId = examResult.id;
    console.log('Created exam with ID:', examId);

    // Create questions with proper type mapping
    const questionsToInsert = examData.questions.map((question, index) => {
      // Map question types to database format
      let questionType = question.type;
      if (question.type === 'single-choice') {
        questionType = 'multiple_choice';
      } else if (question.type === 'multiple-choice') {
        questionType = 'multiple_choice';
      } else if (question.type === 'fill-blank') {
        questionType = 'fill_blank';
      } else if (question.type === 'short-answer') {
        questionType = 'short_answer';
      }

      return {
        exam_id: examId,
        question_text: question.question,
        question_type: questionType,
        options: question.options ? JSON.stringify(question.options) : null,
        correct_answer: Array.isArray(question.correctAnswer) 
          ? JSON.stringify(question.correctAnswer) 
          : question.correctAnswer,
        marks: question.points,
        order_number: index + 1
      };
    });

    console.log('Inserting questions:', questionsToInsert);

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      // Try to clean up the exam if questions failed
      await supabase.from('exams').delete().eq('id', examId);
      throw new Error(`Failed to create questions: ${questionsError.message}`);
    }

    console.log('Successfully created exam and questions');
    return { examId, subjectId };

  } catch (error) {
    console.error('Error in createExamInDatabase:', error);
    throw error;
  }
};

export const generateSampleExams = (): Exam[] => {
  return [
    {
      id: 'sample-math-1',
      title: 'Mathematics Fundamentals',
      description: 'Basic mathematics concepts including algebra and geometry',
      subject: 'Mathematics',
      duration: 45,
      totalMarks: 100,
      passingMarks: 60,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'math-q1',
          text: 'What is the value of x in the equation 2x + 5 = 13?',
          type: 'single-choice',
          options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
          correctAnswer: 'x = 4',
          marks: 25,
          explanation: '2x + 5 = 13, so 2x = 8, therefore x = 4'
        },
        {
          id: 'math-q2',
          text: 'Which of the following are prime numbers? (Select all that apply)',
          type: 'multiple-choice',
          options: ['17', '21', '23', '25'],
          correctAnswer: ['17', '23'],
          marks: 25,
          explanation: '17 and 23 are prime numbers as they have no divisors other than 1 and themselves'
        },
        {
          id: 'math-q3',
          text: 'The area of a circle with radius 5 units is _____ square units.',
          type: 'fill-blank',
          correctAnswer: '25π',
          marks: 25,
          explanation: 'Area = πr² = π × 5² = 25π square units'
        },
        {
          id: 'math-q4',
          text: 'Explain the Pythagorean theorem and provide an example.',
          type: 'short-answer',
          correctAnswer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides. Example: a² + b² = c²',
          marks: 25,
          explanation: 'Full explanation should include the formula and a practical example'
        }
      ]
    },
    {
      id: 'sample-physics-1',
      title: 'Physics Basics',
      description: 'Fundamental concepts in physics including motion and energy',
      subject: 'Physics',
      duration: 40,
      totalMarks: 100,
      passingMarks: 50,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'physics-q1',
          text: 'What is the SI unit of force?',
          type: 'single-choice',
          options: ['Joule', 'Newton', 'Watt', 'Pascal'],
          correctAnswer: 'Newton',
          marks: 25,
          explanation: 'Newton (N) is the SI unit of force, named after Isaac Newton'
        },
        {
          id: 'physics-q2',
          text: 'Which of the following are forms of energy? (Select all that apply)',
          type: 'multiple-choice',
          options: ['Kinetic', 'Potential', 'Thermal', 'All of the above'],
          correctAnswer: ['Kinetic', 'Potential', 'Thermal'],
          marks: 25,
          explanation: 'Kinetic, potential, and thermal are all different forms of energy'
        },
        {
          id: 'physics-q3',
          text: 'The acceleration due to gravity on Earth is approximately _____ m/s².',
          type: 'fill-blank',
          correctAnswer: '9.8',
          marks: 25,
          explanation: 'The standard acceleration due to gravity is 9.8 m/s²'
        },
        {
          id: 'physics-q4',
          text: 'Define velocity and explain how it differs from speed.',
          type: 'short-answer',
          correctAnswer: 'Velocity is speed with direction. Speed is scalar (magnitude only), while velocity is vector (magnitude and direction).',
          marks: 25,
          explanation: 'Velocity includes both magnitude and direction, making it a vector quantity'
        }
      ]
    },
    {
      id: 'sample-english-1',
      title: 'English Language Skills',
      description: 'Grammar, vocabulary, and reading comprehension',
      subject: 'English',
      duration: 30,
      totalMarks: 100,
      passingMarks: 70,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'english-q1',
          text: 'Which sentence is grammatically correct?',
          type: 'single-choice',
          options: [
            'She don\'t like apples',
            'She doesn\'t like apples', 
            'She not like apples',
            'She no like apples'
          ],
          correctAnswer: 'She doesn\'t like apples',
          marks: 25,
          explanation: 'The correct form uses "doesn\'t" for third person singular'
        },
        {
          id: 'english-q2',
          text: 'Which of these are adjectives? (Select all that apply)',
          type: 'multiple-choice',
          options: ['Beautiful', 'Run', 'Tall', 'Quickly'],
          correctAnswer: ['Beautiful', 'Tall'],
          marks: 25,
          explanation: 'Adjectives describe nouns. Beautiful and tall are adjectives.'
        },
        {
          id: 'english-q3',
          text: 'The past tense of "go" is _____.',
          type: 'fill-blank',
          correctAnswer: 'went',
          marks: 25,
          explanation: 'The irregular verb "go" becomes "went" in past tense'
        },
        {
          id: 'english-q4',
          text: 'Write a sentence using the word "although" correctly.',
          type: 'short-answer',
          correctAnswer: 'Although it was raining, we went for a walk.',
          marks: 25,
          explanation: 'Although is used to show contrast between two clauses'
        }
      ]
    },
    {
      id: 'sample-science-1',
      title: 'General Science Quiz',
      description: 'Mixed questions from various science topics',
      subject: 'Science',
      duration: 35,
      totalMarks: 100,
      passingMarks: 55,
      isActive: true,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: [
        {
          id: 'science-q1',
          text: 'What is the chemical symbol for water?',
          type: 'single-choice',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 'H2O',
          marks: 25,
          explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom'
        },
        {
          id: 'science-q2',
          text: 'Which of these are parts of a plant cell? (Select all that apply)',
          type: 'multiple-choice',
          options: ['Cell wall', 'Chloroplasts', 'Nucleus', 'Mitochondria'],
          correctAnswer: ['Cell wall', 'Chloroplasts', 'Nucleus', 'Mitochondria'],
          marks: 25,
          explanation: 'All listed components are found in plant cells'
        },
        {
          id: 'science-q3',
          text: 'The human body has _____ bones.',
          type: 'fill-blank',
          correctAnswer: '206',
          marks: 25,
          explanation: 'An adult human skeleton typically has 206 bones'
        },
        {
          id: 'science-q4',
          text: 'Explain photosynthesis in simple terms.',
          type: 'short-answer',
          correctAnswer: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce glucose and oxygen.',
          marks: 25,
          explanation: 'Plants convert light energy into chemical energy through photosynthesis'
        }
      ]
    }
  ];
};
