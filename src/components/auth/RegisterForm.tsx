import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, User, Mail, Lock, AlertCircle, CheckCircle, X, Check, Loader2, RefreshCw } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole,
    department: '',
    studentId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckDone, setEmailCheckDone] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const { register, resendConfirmation, checkEmailExists, isLoading } = useAuth();

  const validatePasswordStrength = (password: string) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handleEmailBlur = async () => {
    if (formData.email && formData.email.includes('@')) {
      setEmailCheckLoading(true);
      setEmailExists(false);
      setEmailCheckDone(false);
      setError('');
      
      try {
        const result = await checkEmailExists(formData.email);
        
        if (result.exists) {
          setEmailExists(true);
          setError('This email address is already registered. Please try logging in instead.');
        } else if (result.error) {
          // Don't show error for email check failures - just proceed
          console.log('Email check warning:', result.error);
        }
        
        setEmailCheckDone(true);
      } catch (error) {
        console.error('Email check failed:', error);
        // Don't block user - just proceed without check
        setEmailCheckDone(true);
      }
      
      setEmailCheckLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNeedsConfirmation(false);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (emailExists) {
      setError('This email address is already registered. Please try logging in instead.');
      return;
    }

    if (!validatePasswordStrength(formData.password)) {
      setError('Password does not meet strength requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    console.log('Submitting registration form with data:', {
      ...formData,
      password: '[HIDDEN]'
    });

    const result = await register(formData);
    if (result.success) {
      if (result.needsConfirmation) {
        setSuccess('Registration successful! Please check your email and click the confirmation link to activate your account.');
        setNeedsConfirmation(true);
      } else {
        setSuccess('Registration successful! You can now log in.');
      }
      // Clear the form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
        studentId: ''
      });
      setEmailExists(false);
      setEmailCheckDone(false);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    const result = await resendConfirmation(formData.email);
    if (result.success) {
      setSuccess('Confirmation email sent! Please check your inbox and spam folder.');
    } else {
      setError(result.error || 'Failed to resend confirmation email');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'password') {
      validatePasswordStrength(value);
    }
    if (field === 'email') {
      setEmailExists(false);
      setEmailCheckDone(false);
      setError('');
    }
  };

  const getStrengthColor = (isValid: boolean) => isValid ? 'text-green-600' : 'text-red-600';
  const getStrengthIcon = (isValid: boolean) => isValid ? CheckCircle : X;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 3D Geometric Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900" />
        
        {/* Animated 3D geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating cubes */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`cube-${i}`}
              className="absolute bg-gradient-to-br from-purple-400/20 to-blue-400/20 backdrop-blur-sm"
              style={{
                width: `${60 + Math.random() * 40}px`,
                height: `${60 + Math.random() * 40}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)`,
                animation: `float-rotate ${8 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: '8px',
                border: '1px solid rgba(147, 51, 234, 0.3)'
              }}
            />
          ))}
          
          {/* Smaller diamonds */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`diamond-${i}`}
              className="absolute bg-gradient-to-tr from-cyan-400/30 to-purple-400/30"
              style={{
                width: '30px',
                height: '30px',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(45deg) scale(${0.5 + Math.random() * 0.5})`,
                animation: `spin-slow ${6 + Math.random() * 6}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
              }}
            />
          ))}
          
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg border border-white/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
            YourExam.net
          </h1>
          <p className="text-purple-100 text-lg">Create your account</p>
        </div>

        <Card className="shadow-2xl border border-purple-500/20 bg-black/40 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-center text-purple-300">Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-200">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10 bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={handleEmailBlur}
                    className={`pl-10 bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 ${emailExists ? 'border-red-500 focus:border-red-500' : emailCheckDone && !emailExists ? 'border-green-500 focus:border-green-500' : ''}`}
                    disabled={isLoading || emailCheckLoading}
                  />
                  {emailCheckLoading && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-purple-400" />
                  )}
                  {emailExists && (
                    <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                  )}
                  {emailCheckDone && !emailExists && formData.email && (
                    <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {emailExists && (
                  <p className="text-sm text-red-400">This email is already registered</p>
                )}
                {emailCheckDone && !emailExists && formData.email && (
                  <p className="text-sm text-green-400">Email is available</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-purple-200">Role *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => handleChange('role', value)} disabled={isLoading}>
                  <SelectTrigger className="bg-gray-900/60 border-purple-500/30 text-white focus:border-purple-500 focus:ring-purple-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-purple-500/30 z-50">
                    <SelectItem value="student" className="text-white hover:bg-purple-600/20">Student</SelectItem>
                    <SelectItem value="teacher" className="text-white hover:bg-purple-600/20">Teacher</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-purple-600/20">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'teacher' && (
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-purple-200">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter your department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
              )}

              {formData.role === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-purple-200">Student ID</Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="Enter your student ID"
                    value={formData.studentId}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    className="bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
                
                {formData.password && (
                  <div className="mt-2 p-3 bg-gray-900/40 rounded-lg border border-purple-500/20">
                    <p className="text-sm font-medium text-purple-200 mb-2">Password Requirements:</p>
                    <div className="space-y-1 text-xs">
                      {[
                        { key: 'hasMinLength', text: 'At least 8 characters' },
                        { key: 'hasUppercase', text: 'One uppercase letter' },
                        { key: 'hasLowercase', text: 'One lowercase letter' },
                        { key: 'hasNumber', text: 'One number' },
                        { key: 'hasSpecialChar', text: 'One special character' }
                      ].map(({ key, text }) => {
                        const isValid = passwordStrength[key as keyof typeof passwordStrength];
                        const Icon = getStrengthIcon(isValid);
                        return (
                          <div key={key} className={`flex items-center ${getStrengthColor(isValid)}`}>
                            <Icon className="w-3 h-3 mr-2" />
                            {text}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-200">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10 bg-gray-900/60 border-purple-500/30 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500/30 bg-green-900/20">
                  <Check className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              {needsConfirmation && (
                <div className="text-center space-y-3">
                  <p className="text-sm text-purple-200">
                    Didn't receive the email? Check your spam folder or click below to resend.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleResendConfirmation}
                    disabled={isLoading}
                    className="text-sm border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Confirmation Email
                  </Button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg" 
                disabled={isLoading || emailExists || emailCheckLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-purple-300 hover:text-purple-100 text-sm underline"
                disabled={isLoading}
              >
                Already have an account? Sign in here
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-rotate {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
          75% {
            transform: translateY(-30px) rotate(270deg);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterForm;
