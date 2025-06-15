
import { supabase } from '../../lib/supabase';

export const createSampleExams = async (teacherId: string) => {
  try {
    console.log('Creating sample exams for teacher:', teacherId);

    // First, create or get subjects
    const subjects = await createSampleSubjects();
    console.log('Created subjects:', subjects);

    // Create sample exams with different availability settings
    const exams = [
      {
        title: 'Mathematics Fundamentals',
        description: 'Basic algebra and geometry concepts',
        subject_id: subjects.find(s => s.name === 'Mathematics')?.id,
        teacher_id: teacherId,
        duration_minutes: 60,
        total_marks: 100,
        start_time: null, // Always available
        end_time: null,
        is_published: true
      },
      {
        title: 'Physics Chapter 1 Quiz',
        description: 'Motion and forces quiz',
        subject_id: subjects.find(s => s.name === 'Physics')?.id,
        teacher_id: teacherId,
        duration_minutes: 45,
        total_marks: 75,
        start_time: new Date().toISOString(), // Available now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // For 7 days
        is_published: true
      },
      {
        title: 'Chemistry Lab Assessment',
        description: 'Laboratory safety and procedures',
        subject_id: subjects.find(s => s.name === 'Chemistry')?.id,
        teacher_id: teacherId,
        duration_minutes: 90,
        total_marks: 120,
        start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 2 days
        end_time: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 9 days
        is_published: true
      },
      {
        title: 'English Literature Review',
        description: 'Shakespeare and modern poetry analysis',
        subject_id: subjects.find(s => s.name === 'English')?.id,
        teacher_id: teacherId,
        duration_minutes: 120,
        total_marks: 150,
        start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Started 2 days ago
        end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 3 days
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
        await createSampleQuestions(exam.id);
      }
    }

    return examData;
  } catch (error) {
    console.error('Error in createSampleExams:', error);
    throw error;
  }
};

const createSampleSubjects = async () => {
  const subjects = [
    { name: 'Mathematics', description: 'Math and algebra courses' },
    { name: 'Physics', description: 'Physics and mechanics' },
    { name: 'Chemistry', description: 'Chemistry and lab work' },
    { name: 'English', description: 'Literature and writing' }
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

const createSampleQuestions = async (examId: string) => {
  const questions = [
    {
      exam_id: examId,
      question_text: 'What is 2 + 2?',
      question_type: 'single-choice',
      options: ['2', '3', '4', '5'],
      correct_answer: '4',
      marks: 10,
      order_number: 1
    },
    {
      exam_id: examId,
      question_text: 'Which of the following are prime numbers? (Select all that apply)',
      question_type: 'multiple-choice',
      options: ['2', '3', '4', '5', '6', '7'],
      correct_answer: '2,3,5,7',
      marks: 15,
      order_number: 2
    },
    {
      exam_id: examId,
      question_text: 'The speed of light in vacuum is _______ m/s.',
      question_type: 'fill-blank',
      options: null,
      correct_answer: '299792458',
      marks: 20,
      order_number: 3
    }
  ];

  const { error } = await supabase
    .from('questions')
    .insert(questions);

  if (error) {
    console.error('Error creating questions:', error);
    throw error;
  }
};
