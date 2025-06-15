
import { supabase } from '../../lib/supabase';

export const createSampleExams = async (teacherId: string) => {
  console.log('Creating sample exams for teacher:', teacherId);
  
  try {
    // First create subjects if they don't exist
    const subjects = [
      { name: 'Mathematics', description: 'Mathematical concepts and problem solving' },
      { name: 'Physics', description: 'Physical sciences and natural phenomena' },
      { name: 'English', description: 'Language arts and literature' }
    ];

    const createdSubjects = [];
    for (const subject of subjects) {
      const { data: existingSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subject.name)
        .single();

      if (existingSubject) {
        createdSubjects.push(existingSubject);
      } else {
        const { data: newSubject, error } = await supabase
          .from('subjects')
          .insert({
            name: subject.name,
            description: subject.description,
            created_by: teacherId
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error creating subject:', error);
          throw error;
        }
        createdSubjects.push(newSubject);
      }
    }

    // Create sample exams with corrected field mapping
    const sampleExams = [
      {
        title: 'Mathematics Fundamentals',
        description: 'Test your understanding of basic mathematical concepts including algebra, geometry, and arithmetic.',
        subject_id: createdSubjects[0].id,
        creator_id: teacherId, // Changed from teacher_id to creator_id
        duration_minutes: 45,
        total_marks: 40,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_published: true
      },
      {
        title: 'Physics Basics',
        description: 'Fundamental concepts in physics including motion, energy, and forces.',
        subject_id: createdSubjects[1].id,
        creator_id: teacherId, // Changed from teacher_id to creator_id
        duration_minutes: 40,
        total_marks: 35,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_published: true
      },
      {
        title: 'English Language Skills',
        description: 'Assessment of grammar, vocabulary, and reading comprehension skills.',
        subject_id: createdSubjects[2].id,
        creator_id: teacherId, // Changed from teacher_id to creator_id
        duration_minutes: 30,
        total_marks: 30,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_published: true
      }
    ];

    // Insert exams
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .insert(sampleExams)
      .select('id, title');

    if (examError) {
      console.error('Error creating exams:', examError);
      throw examError;
    }

    console.log('Created exams:', examData);

    // Create questions for each exam
    const allQuestions = [];

    // Math questions
    const mathQuestions = [
      {
        exam_id: examData[0].id,
        question_text: 'What is the value of 2x + 5 when x = 3?',
        question_type: 'multiple_choice',
        options: JSON.stringify(['8', '11', '13', '16']),
        correct_answer: '11',
        marks: 10,
        order_number: 1
      },
      {
        exam_id: examData[0].id,
        question_text: 'Which of the following is a prime number?',
        question_type: 'multiple_choice',
        options: JSON.stringify(['15', '21', '17', '25']),
        correct_answer: '17',
        marks: 10,
        order_number: 2
      },
      {
        exam_id: examData[0].id,
        question_text: 'The area of a rectangle with length 8 units and width 5 units is _____ square units.',
        question_type: 'fill_blank',
        correct_answer: '40',
        marks: 10,
        order_number: 3
      },
      {
        exam_id: examData[0].id,
        question_text: 'Explain the Pythagorean theorem and provide an example of its application.',
        question_type: 'short_answer',
        correct_answer: 'The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides (a² + b² = c²).',
        marks: 10,
        order_number: 4
      }
    ];

    // Physics questions
    const physicsQuestions = [
      {
        exam_id: examData[1].id,
        question_text: 'What is the unit of force in the SI system?',
        question_type: 'multiple_choice',
        options: JSON.stringify(['Joule', 'Newton', 'Watt', 'Pascal']),
        correct_answer: 'Newton',
        marks: 8,
        order_number: 1
      },
      {
        exam_id: examData[1].id,
        question_text: 'Which of the following are forms of energy? (Select all that apply)',
        question_type: 'multiple_choice',
        options: JSON.stringify(['Kinetic', 'Potential', 'Thermal', 'Chemical']),
        correct_answer: JSON.stringify(['Kinetic', 'Potential', 'Thermal', 'Chemical']),
        marks: 12,
        order_number: 2
      },
      {
        exam_id: examData[1].id,
        question_text: 'The acceleration due to gravity on Earth is approximately _____ m/s².',
        question_type: 'fill_blank',
        correct_answer: '9.8',
        marks: 7,
        order_number: 3
      },
      {
        exam_id: examData[1].id,
        question_text: 'Describe Newton\'s first law of motion and provide a real-world example.',
        question_type: 'short_answer',
        correct_answer: 'Newton\'s first law states that an object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force.',
        marks: 8,
        order_number: 4
      }
    ];

    // English questions
    const englishQuestions = [
      {
        exam_id: examData[2].id,
        question_text: 'Which sentence is grammatically correct?',
        question_type: 'multiple_choice',
        options: JSON.stringify([
          'She don\'t like coffee.',
          'She doesn\'t likes coffee.',
          'She doesn\'t like coffee.',
          'She not like coffee.'
        ]),
        correct_answer: 'She doesn\'t like coffee.',
        marks: 8,
        order_number: 1
      },
      {
        exam_id: examData[2].id,
        question_text: 'What is the synonym of "enormous"?',
        question_type: 'multiple_choice',
        options: JSON.stringify(['Tiny', 'Huge', 'Medium', 'Small']),
        correct_answer: 'Huge',
        marks: 7,
        order_number: 2
      },
      {
        exam_id: examData[2].id,
        question_text: 'The past tense of "write" is _____.',
        question_type: 'fill_blank',
        correct_answer: 'wrote',
        marks: 7,
        order_number: 3
      },
      {
        exam_id: examData[2].id,
        question_text: 'Write a brief paragraph (3-4 sentences) about your favorite hobby.',
        question_type: 'short_answer',
        correct_answer: 'Sample answer about a hobby with proper grammar and sentence structure.',
        marks: 8,
        order_number: 4
      }
    ];

    allQuestions.push(...mathQuestions, ...physicsQuestions, ...englishQuestions);

    // Insert all questions
    const { error: questionsError } = await supabase
      .from('questions')
      .insert(allQuestions);

    if (questionsError) {
      console.error('Error creating questions:', questionsError);
      throw questionsError;
    }

    console.log('Successfully created sample exams with questions');
    return examData;
  } catch (error) {
    console.error('Error in createSampleExams:', error);
    throw error;
  }
};
