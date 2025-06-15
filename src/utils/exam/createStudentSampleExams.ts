
import { supabase } from '../../lib/supabase';

export const createStudentSampleExams = async () => {
  try {
    console.log('Creating sample exams for students to access');

    // First, get or create a default teacher (use first teacher in system or create one)
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'teacher')
      .limit(1);

    let teacherId = teachers?.[0]?.id;

    // If no teacher exists, we'll need admin privileges to create sample data
    if (!teacherId) {
      console.log('No teacher found, creating sample teacher for demo purposes');
      // For demo purposes, create a sample teacher
      const { data: newTeacher, error: teacherError } = await supabase.auth.signUp({
        email: 'teacher@demo.com',
        password: 'demo123456',
        options: {
          data: {
            name: 'Demo Teacher',
            role: 'teacher',
            department: 'General'
          }
        }
      });

      if (teacherError) {
        console.error('Error creating demo teacher:', teacherError);
        throw teacherError;
      }

      teacherId = newTeacher.user?.id;
    }

    // Create or get subjects
    const subjects = await createSampleSubjects();
    console.log('Created subjects:', subjects);

    // Create sample exams - one always available and others with time constraints
    const exams = [
      {
        title: 'General Knowledge Quiz',
        description: 'Basic general knowledge test - always available for practice',
        subject_id: subjects.find(s => s.name === 'General')?.id || subjects[0]?.id,
        teacher_id: teacherId,
        duration_minutes: 30,
        total_marks: 50,
        start_time: null, // Always available
        end_time: null,   // Always available
        is_published: true
      },
      {
        title: 'Mathematics Practice Test',
        description: 'Basic math concepts and problem solving',
        subject_id: subjects.find(s => s.name === 'Mathematics')?.id || subjects[0]?.id,
        teacher_id: teacherId,
        duration_minutes: 45,
        total_marks: 75,
        start_time: new Date().toISOString(), // Available now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // For 7 days
        is_published: true
      },
      {
        title: 'Science Fundamentals',
        description: 'Basic science concepts and principles',
        subject_id: subjects.find(s => s.name === 'Science')?.id || subjects[0]?.id,
        teacher_id: teacherId,
        duration_minutes: 60,
        total_marks: 100,
        start_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Starts tomorrow
        end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // Available for a week
        is_published: true
      }
    ];

    // Insert exams
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert(exams)
      .select();

    if (examError) {
      console.error('Error creating exams:', examError);
      throw examError;
    }

    console.log('Created exams:', examData);

    // Create sample questions for each exam
    if (examData) {
      for (const exam of examData) {
        await createSampleQuestionsForExam(exam.id, exam.title);
      }
    }

    return examData;
  } catch (error) {
    console.error('Error in createStudentSampleExams:', error);
    throw error;
  }
};

const createSampleSubjects = async () => {
  const subjects = [
    { name: 'General', description: 'General knowledge and mixed topics' },
    { name: 'Mathematics', description: 'Math and algebra courses' },
    { name: 'Science', description: 'Basic science concepts' },
    { name: 'English', description: 'Language and comprehension' }
  ];

  // Check if subjects already exist
  const { data: existingSubjects } = await supabase
    .from('subjects')
    .select('*')
    .in('name', subjects.map(s => s.name));

  const subjectsToCreate = subjects.filter(
    subject => !existingSubjects?.some(existing => existing.name === subject.name)
  );

  if (subjectsToCreate.length > 0) {
    const { data: newSubjects, error } = await supabase
      .from('subjects')
      .insert(subjectsToCreate)
      .select();

    if (error) {
      console.error('Error creating subjects:', error);
      throw error;
    }

    return [...(existingSubjects || []), ...(newSubjects || [])];
  }

  return existingSubjects || [];
};

const createSampleQuestionsForExam = async (examId: string, examTitle: string) => {
  let questions;

  if (examTitle.includes('General Knowledge')) {
    questions = [
      {
        exam_id: examId,
        question_text: 'What is the capital of France?',
        question_type: 'single-choice',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correct_answer: 'Paris',
        marks: 10,
        order_number: 1
      },
      {
        exam_id: examId,
        question_text: 'Which of the following are continents? (Select all that apply)',
        question_type: 'multiple-choice',
        options: ['Asia', 'Europe', 'Atlantis', 'Africa', 'Australia'],
        correct_answer: 'Asia,Europe,Africa,Australia',
        marks: 15,
        order_number: 2
      },
      {
        exam_id: examId,
        question_text: 'The largest ocean on Earth is the _______ Ocean.',
        question_type: 'fill-blank',
        options: null,
        correct_answer: 'Pacific',
        marks: 10,
        order_number: 3
      },
      {
        exam_id: examId,
        question_text: 'Explain in a few words what photosynthesis is.',
        question_type: 'short-answer',
        options: null,
        correct_answer: 'Process by which plants make food using sunlight',
        marks: 15,
        order_number: 4
      }
    ];
  } else if (examTitle.includes('Mathematics')) {
    questions = [
      {
        exam_id: examId,
        question_text: 'What is 15 + 27?',
        question_type: 'single-choice',
        options: ['40', '41', '42', '43'],
        correct_answer: '42',
        marks: 15,
        order_number: 1
      },
      {
        exam_id: examId,
        question_text: 'Which of the following are prime numbers?',
        question_type: 'multiple-choice',
        options: ['2', '3', '4', '5', '6', '7'],
        correct_answer: '2,3,5,7',
        marks: 20,
        order_number: 2
      },
      {
        exam_id: examId,
        question_text: 'The square root of 64 is _______.',
        question_type: 'fill-blank',
        options: null,
        correct_answer: '8',
        marks: 15,
        order_number: 3
      },
      {
        exam_id: examId,
        question_text: 'What is the formula for the area of a circle?',
        question_type: 'short-answer',
        options: null,
        correct_answer: 'π × r²',
        marks: 25,
        order_number: 4
      }
    ];
  } else {
    // Default science questions
    questions = [
      {
        exam_id: examId,
        question_text: 'What is the chemical symbol for water?',
        question_type: 'single-choice',
        options: ['H2O', 'CO2', 'O2', 'H2'],
        correct_answer: 'H2O',
        marks: 20,
        order_number: 1
      },
      {
        exam_id: examId,
        question_text: 'Which of these are states of matter?',
        question_type: 'multiple-choice',
        options: ['Solid', 'Liquid', 'Gas', 'Plasma', 'Energy'],
        correct_answer: 'Solid,Liquid,Gas,Plasma',
        marks: 25,
        order_number: 2
      },
      {
        exam_id: examId,
        question_text: 'The process by which plants make their own food is called _______.',
        question_type: 'fill-blank',
        options: null,
        correct_answer: 'photosynthesis',
        marks: 25,
        order_number: 3
      },
      {
        exam_id: examId,
        question_text: 'Explain what gravity is.',
        question_type: 'short-answer',
        options: null,
        correct_answer: 'Force that attracts objects toward each other',
        marks: 30,
        order_number: 4
      }
    ];
  }

  const { error } = await supabase
    .from('questions')
    .insert(questions);

  if (error) {
    console.error('Error creating questions:', error);
    throw error;
  }
};
