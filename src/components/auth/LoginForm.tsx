
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loading } from '../ui/loading';
import { GraduationCap, Mail, Lock, AlertCircle, RefreshCw, BookOpen, Trophy, Users } from 'lucide-react';

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

  // Show loading overlay during login
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <Loading size="lg" text="Signing you in..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-blue-200 rounded-lg transform rotate-45 opacity-50 animate-pulse"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-slate-100 rounded-full opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-blue-300 rounded-lg transform -rotate-12 opacity-50 animate-bounce"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2364748b' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            YourExam.net
          </h1>
          <p className="text-slate-600 text-lg">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-center text-slate-800">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email or Student ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or student ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="captcha" className="text-slate-700">Security Check</Label>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded border border-blue-200 font-mono text-lg text-blue-800 font-bold flex-1 text-center">
                    {captchaQuestion}
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Answer"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    className="w-24 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateCaptcha}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 space-y-2 text-center">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 hover:text-blue-500 text-sm underline"
              >
                Forgot your password?
              </button>
              <div>
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-500 text-sm"
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
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">MASTER ESSENTIAL SKILLS</h3>
            </div>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Focuses on building <span className="text-blue-600 font-semibold">strong students</span> who are able to face the world</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Master the skills you need to <span className="text-blue-600 font-semibold">maximize your potential</span></p>
              </div>
            </div>
          </div>

          {/* Join your real world Excellence */}
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">JOIN YOUR REAL WORLD EXCELLENCE</h3>
            </div>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Put all your <span className="text-blue-600 font-semibold">knowledge here</span></p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Study hard and <span className="text-blue-600 font-semibold">pass all your exams</span></p>
              </div>
            </div>
          </div>

          {/* Access to Success */}
          <div className="bg-white/80 backdrop-blur-lg border border-slate-200 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">ACCESS TO SUCCESS</h3>
            </div>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">In order to be successful you need to <span className="text-blue-600 font-semibold">pass a lot of exams</span> in your life</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-sm">Success means <span className="text-blue-600 font-semibold">solving problems</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <p className="text-slate-600 text-lg mb-4">
            That's exactly what you can do, join <span className="text-blue-600 font-bold">YourExam.net</span> and solve your <span className="text-blue-600 font-bold">PROBLEMS</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
