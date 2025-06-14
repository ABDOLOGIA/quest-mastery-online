
import { checkEmailExists } from '../utils/emailValidation';
import { checkStudentIdExists } from '../utils/studentIdValidation';
import { login } from '../utils/authLogin';
import { register } from '../utils/authRegistration';
import { resendConfirmation, logout } from '../utils/authConfirmation';

export const useAuthOperations = () => {
  return {
    checkEmailExists,
    checkStudentIdExists,
    login,
    register,
    resendConfirmation,
    logout
  };
};
