import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, Lock, AlertCircle, RefreshCw, BookOpen, Target, Trophy, Users } from 'lucide-react';

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
  const { login, isLoading } = useAuth();

  // Generate more complex captcha
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

    const success = await login(email, password);
    if (!success) {
      setError('Invalid email/ID or password');
      generateCaptcha();
      setCaptcha('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced 3D Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Golden floating cubes */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 transform rotate-45 animate-bounce opacity-80 shadow-2xl"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-700 transform rotate-12 animate-pulse opacity-70 shadow-xl"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 bg-gradient-to-br from-yellow-200 to-yellow-500 transform -rotate-12 animate-spin-slow opacity-60 shadow-2xl"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-600 transform rotate-45 animate-bounce opacity-75 shadow-xl"></div>
        
        {/* Black geometric shapes */}
        <div className="absolute top-60 left-60 w-24 h-24 bg-black opacity-20 transform rotate-45 animate-pulse shadow-lg"></div>
        <div className="absolute top-80 right-60 w-18 h-18 bg-gray-800 opacity-30 transform -rotate-12 animate-bounce shadow-lg"></div>
        
        {/* Golden circles */}
        <div className="absolute top-32 right-80 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 opacity-20 animate-pulse shadow-2xl"></div>
        <div className="absolute bottom-40 left-80 w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 opacity-25 animate-bounce shadow-xl"></div>
        
        {/* Moving particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-yellow-500 rounded-full animate-bounce"></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-yellow-400 shadow-2xl">
              <GraduationCap className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-600 bg-clip-text text-transparent mb-2">
            Exam.net
          </h1>
          <p className="text-yellow-100 text-lg">Sign in to your account</p>
        </div>

        <Card className="shadow-2xl bg-black bg-opacity-80 backdrop-blur-lg border-2 border-yellow-400">
          <CardHeader>
            <CardTitle className="text-center text-yellow-300">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-yellow-100">Email or Student ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-yellow-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or student ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-900 border-yellow-600 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-yellow-100">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-yellow-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-900 border-yellow-600 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-yellow-100">Security Check</Label>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded border font-mono text-lg text-black font-bold flex-1 text-center">
                    {captchaQuestion}
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Answer"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    className="w-24 bg-gray-900 border-yellow-600 text-white placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateCaptcha}
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-900 border-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-100">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                Forgot your password?
              </button>
              <div>
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-yellow-400 hover:text-yellow-300 text-sm"
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
          {/* Master Essential Skills */}
          <div className="bg-black bg-opacity-60 backdrop-blur-lg border border-yellow-400 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-300">MASTER ESSENTIAL SKILLS</h3>
            </div>
            <div className="space-y-3 text-yellow-100">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Study from <span className="text-yellow-300 font-semibold">2am to 6pm/month</span> to build strong foundations</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Master the skills you need to <span className="text-yellow-300 font-semibold">maximize your potential</span></p>
              </div>
            </div>
          </div>

          {/* Join Academic Excellence */}
          <div className="bg-black bg-opacity-60 backdrop-blur-lg border border-yellow-400 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-300">JOIN ACADEMIC EXCELLENCE</h3>
            </div>
            <div className="space-y-3 text-yellow-100">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Collaborate <span className="text-yellow-300 font-semibold">with peers</span> who understand your journey</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Make <span className="text-yellow-300 font-semibold">meaningful friends</span> on your journey</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Network with <span className="text-yellow-300 font-semibold">10,000+</span> students</p>
              </div>
            </div>
          </div>

          {/* Access to Success */}
          <div className="bg-black bg-opacity-60 backdrop-blur-lg border border-yellow-400 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-yellow-300">ACCESS TO SUCCESS</h3>
            </div>
            <div className="space-y-3 text-yellow-100">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Mentors on <span className="text-yellow-300 font-semibold">hyper-successful</span> careers in their field</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Get <span className="text-yellow-300 font-semibold">1-on-1 advice</span> from industry experts</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Talk to <span className="text-yellow-300 font-semibold">top industry</span> experts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <p className="text-yellow-100 text-lg mb-4">
            That's exactly what you can do inside <span className="text-yellow-300 font-bold">THE REAL WORLD.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
