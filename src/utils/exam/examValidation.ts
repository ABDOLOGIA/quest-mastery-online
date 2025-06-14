
import { Exam } from '../../types/exam';

export const validateExamData = (examData: Omit<Exam, 'id'>) => {
  const errors: Record<string, string> = {};

  if (!examData.title?.trim()) {
    errors.title = 'Exam title is required';
  }

  if (!examData.subject?.trim()) {
    errors.subject = 'Subject is required';
  }

  if (!examData.duration || examData.duration <= 0) {
    errors.duration = 'Duration must be greater than 0 minutes';
  }

  if (!examData.totalPoints || examData.totalPoints <= 0) {
    errors.totalPoints = 'Total points must be greater than 0';
  }

  if (!examData.alwaysAvailable) {
    if (!examData.startTime) {
      errors.startTime = 'Start time is required when not always available';
    }
    if (!examData.endTime) {
      errors.endTime = 'End time is required when not always available';
    }
    if (examData.startTime && examData.endTime && examData.startTime >= examData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
  }

  if (examData.questions && examData.questions.length === 0) {
    errors.questions = 'At least one question is required';
  }

  return errors;
};
