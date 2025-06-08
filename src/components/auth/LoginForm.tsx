
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, Lock, AlertCircle, RefreshCw, BookOpen, Trophy, Users, Check, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const { login, resendConfirmation, isLoading } = useAuth();

  // Generate captcha
  React.useEffect(() => {
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
    if (!email) {
      setError('Please enter your email address first');
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

    if (!email || !password) {
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
    console.log('Attempting login with email:', email);
    
    try {
      const result = await login(email, password);
      
      if (!result.success) {
        setError(result.error || 'Invalid email or password');
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

  // Show loading overlay during initial auth check
  if (isLoading && !isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg flex items-center space-x-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 3D Animated Night Sea Background */}
      <div className="absolute inset-0">
        {/* Night Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800" />
        
        {/* Animated Stars */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Moon */}
        <div 
          className="absolute w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-2xl"
          style={{
            top: '15%',
            right: '20%',
            boxShadow: '0 0 50px rgba(255, 255, 200, 0.4), inset -10px -10px 0 rgba(0, 0, 0, 0.1)',
            animation: 'moonGlow 4s ease-in-out infinite alternate'
          }}
        >
          {/* Moon craters */}
          <div className="absolute w-3 h-3 bg-gray-300 rounded-full top-6 left-8 opacity-30" />
          <div className="absolute w-2 h-2 bg-gray-300 rounded-full top-16 left-16 opacity-20" />
          <div className="absolute w-4 h-4 bg-gray-300 rounded-full top-20 left-6 opacity-25" />
        </div>

        {/* Moon Reflection on Water */}
        <div 
          className="absolute bottom-0 left-0 w-full h-2/3"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(30, 58, 138, 0.3) 40%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          {/* Animated Water Waves - Multiple Layers */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Wave Layer 1 */}
            <div 
              className="absolute bottom-0 left-0 w-[200%] h-32 opacity-20"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(59, 130, 246, 0.3) 50px, rgba(59, 130, 246, 0.3) 100px)',
                animation: 'wave1 8s linear infinite'
              }}
            />
            {/* Wave Layer 2 */}
            <div 
              className="absolute bottom-0 left-0 w-[200%] h-24 opacity-30"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(29, 78, 216, 0.4) 30px, rgba(29, 78, 216, 0.4) 60px)',
                animation: 'wave2 6s linear infinite reverse'
              }}
            />
            {/* Wave Layer 3 */}
            <div 
              className="absolute bottom-0 left-0 w-[200%] h-16 opacity-40"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(37, 99, 235, 0.5) 20px, rgba(37, 99, 235, 0.5) 40px)',
                animation: 'wave3 4s linear infinite'
              }}
            />
          </div>

          {/* Moon Reflection */}
          <div 
            className="absolute w-16 h-64 opacity-60"
            style={{
              right: '20%',
              bottom: '0',
              background: 'linear-gradient(to bottom, rgba(255, 255, 200, 0.6) 0%, rgba(255, 255, 200, 0.3) 50%, transparent 100%)',
              filter: 'blur(2px)',
              animation: 'moonReflection 3s ease-in-out infinite alternate',
              transform: 'skew(-2deg, 0)'
            }}
          />

          {/* Shimmering Water Surface */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-transparent via-blue-300/10 to-transparent animate-pulse" />
        </div>

        {/* Floating Particles for Depth */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-200/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${60 + Math.random() * 40}%`,
                animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        {/* Subtle Mist Effect */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/3 opacity-20"
          style={{
            background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
            animation: 'mist 10s ease-in-out infinite alternate'
          }}
        />

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
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
                <Label htmlFor="email" className="text-gray-200">Email or Student ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-yellow-500" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or student ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

      {/* Features Section */}
      <div className="w-full max-w-6xl mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400">MASTER ESSENTIAL SKILLS</h3>
            </div>
            <div className="space-y-3 text-gray-200">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Focuses on building <span className="text-yellow-400 font-semibold">strong students</span> who are able to face the world</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Master the skills you need to <span className="text-yellow-400 font-semibold">maximize your potential</span></p>
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400">JOIN YOUR REAL WORLD EXCELLENCE</h3>
            </div>
            <div className="space-y-3 text-gray-200">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Put all your <span className="text-yellow-400 font-semibold">knowledge here</span></p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Study hard and <span className="text-yellow-400 font-semibold">pass all your exams</span></p>
              </div>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-400">ACCESS TO SUCCESS</h3>
            </div>
            <div className="space-y-3 text-gray-200">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">In order to be successful you need to <span className="text-yellow-400 font-semibold">pass a lot of exams</span> in your life</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Success means <span className="text-yellow-400 font-semibold">solving problems</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-200 text-lg mb-4">
            That's exactly what you can do, join <span className="text-yellow-400 font-bold">YourExam.net</span> and solve your <span className="text-yellow-400 font-bold">PROBLEMS</span>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes moonGlow {
          0% { box-shadow: 0 0 30px rgba(255, 255, 200, 0.3), inset -8px -8px 0 rgba(0, 0, 0, 0.1); }
          100% { box-shadow: 0 0 60px rgba(255, 255, 200, 0.6), inset -12px -12px 0 rgba(0, 0, 0, 0.15); }
        }
        
        @keyframes wave1 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        
        @keyframes wave2 {
          0% { transform: translateX(-50%) translateY(10px); }
          100% { transform: translateX(0%) translateY(0px); }
        }
        
        @keyframes wave3 {
          0% { transform: translateX(-50%) translateY(5px); }
          100% { transform: translateX(0%) translateY(-5px); }
        }
        
        @keyframes moonReflection {
          0% { opacity: 0.4; transform: skew(-1deg, 0) scale(1); }
          100% { opacity: 0.7; transform: skew(-3deg, 0) scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
          66% { transform: translateY(-10px) translateX(-5px); opacity: 0.5; }
        }
        
        @keyframes mist {
          0% { opacity: 0.1; transform: translateX(0px); }
          100% { opacity: 0.3; transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
