
// Re-export all functions from the modular exam utilities for backward compatibility
export { loadExamsFromDatabase } from './exam/examLoader';
export { loadAttemptsFromDatabase } from './exam/attemptLoader';
export { loadStudentExamsFromDatabase } from './exam/studentExamLoader';
export { getAllStudentsFromDatabase } from './exam/studentLoader';
export { submitExamToDatabase } from './exam/examSubmission';
