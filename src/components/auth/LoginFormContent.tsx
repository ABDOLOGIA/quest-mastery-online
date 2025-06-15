
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, Lock, AlertCircle, RefreshCw, Check, Loader2 } from 'lucide-react';

interface LoginFormContentProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginFormContent: React.FC<LoginFormContentProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const { login, resendConfirmation } = useAuth();

  // Generate captcha
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 20;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
    }
    
    setCaptchaQuestion(`${num1} ${operation} ${num2} = ?`);
    setCaptchaAnswer(answer);
  };

  const handleResendConfirmation = async () => {
    let email = emailOrStudentId;
    
    if (!emailOrStudentId.includes('@')) {
      setError('Please enter your email address to resend confirmation');
      return;
    }

    setResendingConfirmation(true);
    const result = await resendConfirmation(email);
    setResendingConfirmation(false);
    
    if (result.success) {
      setError('');
      setNeedsConfirmation(false);
      alert('Confirmation email sent! Please check your inbox and click the confirmation link.');
    } else {
      setError(result.error || 'Failed to resend confirmation email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsConfirmation(false);

    if (!emailOrStudentId || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (parseInt(captcha) !== captchaAnswer) {
      setError('Incorrect captcha. Please try again.');
      generateCaptcha();
      setCaptcha('');
      return;
    }

    setIsSubmitting(true);
    console.log('Attempting login with:', emailOrStudentId);
    
    try {
      const result = await login(emailOrStudentId, password);
      
      if (!result.success) {
        setError(result.error || 'Invalid credentials');
        generateCaptcha();
        setCaptcha('');
        
        if (result.needsConfirmation) {
          setNeedsConfirmation(true);
        }
      } else {
        console.log('Login successful, user should be redirected');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      generateCaptcha();
      setCaptcha('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-10 h-10 text-black" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
          YourExam.net
        </h1>
        <p className="text-gray-200 text-lg">Sign in to your account</p>
      </div>

      <Card className="shadow-xl border border-yellow-500/20 bg-black/60 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-center text-yellow-400">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailOrStudentId" className="text-gray-200">Email or Student ID</Label>
              <div className="relative">
                {emailOrStudentId.includes('@') ? (
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                ) : (
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                )}
                <Input
                  id="emailOrStudentId"
                  type="text"
                  placeholder="Enter your email or student ID"
                  value={emailOrStudentId}
                  onChange={(e) => setEmailOrStudentId(e.target.value)}
                  className="pl-10 bg-gray-900/80 border-yellow-500/30 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-900/80 border-yellow-500/30 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="captcha" className="text-gray-200">Security Check</Label>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 p-3 rounded font-mono text-lg text-yellow-400 font-bold flex-1 text-center">
                  {captchaQuestion}
                </div>
                <Input
                  id="captcha"
                  type="number"
                  placeholder="Answer"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  className="w-24 bg-gray-900/80 border-yellow-500/30 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                  disabled={isSubmitting}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generateCaptcha}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  disabled={isSubmitting}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500/30">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {needsConfirmation && (
              <Alert className="border-yellow-500/30 bg-yellow-500/10">
                <Check className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  Your email needs to be confirmed before you can log in.
                  <Button 
                    type="button" 
                    variant="link" 
                    onClick={handleResendConfirmation}
                    className="text-yellow-300 hover:text-yellow-100 p-0 ml-2 h-auto"
                    disabled={isSubmitting || resendingConfirmation}
                  >
                    {resendingConfirmation ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend confirmation email'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-semibold shadow-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-2 text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              disabled={isSubmitting}
            >
              Forgot your password?
            </button>
            <div>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-yellow-400 hover:text-yellow-300 text-sm"
                disabled={isSubmitting}
              >
                Don't have an account? Register here
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginFormContent;
