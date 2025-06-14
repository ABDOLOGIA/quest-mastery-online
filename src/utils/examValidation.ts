
import { Exam } from '../types/exam';

interface ValidationError {
  field: string;
  message: string;
}

export function validateExam(exam: Omit<Exam, 'id'>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!exam.title?.trim()) {
    errors.push({ field: 'title', message: 'Exam title is required' });
  }

  if (!exam.subject?.trim()) {
    errors.push({ field: 'subject', message: 'Subject is required' });
  }

  if (!exam.duration || exam.duration <= 0) {
    errors.push({ field: 'duration', message: 'Duration must be greater than 0 minutes' });
  }

  if (!exam.totalPoints || exam.totalPoints <= 0) {
    errors.push({ field: 'totalPoints', message: 'Total points must be greater than 0' });
  }

  if (!exam.alwaysAvailable) {
    if (!exam.startTime) {
      errors.push({ field: 'startTime', message: 'Start time is required when not always available' });
    }
    if (!exam.endTime) {
      errors.push({ field: 'endTime', message: 'End time is required when not always available' });
    }
    if (exam.startTime && exam.endTime && exam.startTime >= exam.endTime) {
      errors.push({ field: 'endTime', message: 'End time must be after start time' });
    }
  }

  if (!exam.questions || exam.questions.length === 0) {
    errors.push({ field: 'questions', message: 'At least one question is required' });
  }

  // Validate questions
  exam.questions?.forEach((question, index) => {
    if (!question.question?.trim()) {
      errors.push({ 
        field: `question-${index}`, 
        message: `Question ${index + 1} text is required` 
      });
    }
    if (!question.correctAnswer) {
      errors.push({ 
        field: `question-${index}-answer`, 
        message: `Question ${index + 1} must have a correct answer` 
      });
    }
    if (question.points <= 0) {
      errors.push({ 
        field: `question-${index}-points`, 
        message: `Question ${index + 1} must have positive points` 
      });
    }
  });

  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => error.message).join('; ');
}
