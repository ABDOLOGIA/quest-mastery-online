import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, Lock, AlertCircle, RefreshCw, BookOpen, Trophy, Users, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onForgotPassword }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [error, setError] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { login, resendConfirmation, isLoading } = useAuth();

  // Success stories data with uploaded images
  const successStories = [
    {
      image: '/lovable-uploads/38cce33a-d8e0-4689-bf0b-16697ac67160.png',
      title: 'Certificate of Excellence',
      description: 'Transform your career with recognized certifications. Every exam you pass brings you closer to your professional goals.',
      quote: '"Success is not just about passing exams, it\'s about mastering knowledge that changes your life."'
    },
    {
      image: '/lovable-uploads/05cff9ed-fc1f-417a-abd4-445b42ab51fa.png',
      title: 'Graduation Achievement',
      description: 'Join thousands of successful graduates who have transformed their careers through dedicated learning and excellence.',
      quote: '"The future belongs to those who prepare for it today through continuous learning."'
    },
    {
      image: '/lovable-uploads/602297ea-2b1d-42a9-bf6f-4ad6d2e492b5.png',
      title: 'Focused Study Environment',
      description: 'Create the perfect learning space for success. Dedicated study time leads to extraordinary results.',
      quote: '"Every hour spent studying is an investment in your future success."'
    },
    {
      image: '/lovable-uploads/7d2601f9-e4ef-4739-bbd4-f679dbf4189e.png',
      title: 'Digital Learning Excellence',
      description: 'Master modern examination platforms and excel in digital assessments with confidence and skill.',
      quote: '"Technology and determination combine to create unstoppable success."'
    },
    {
      image: '/lovable-uploads/18a2de41-44bf-4e53-865b-84606c4b31ca.png',
      title: 'Student Success Story',
      description: 'Real students achieving real success through dedication and smart preparation. Your journey to excellence starts here.',
      quote: '"With the right mindset and preparation, every student can achieve extraordinary results."'
    }
  ];

  // Generate captcha
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  // Auto-advance slides
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % successStories.length);
    }, 5000);
    return () => clearInterval(timer);
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
    // For resending confirmation, we need an email address
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % successStories.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + successStories.length) % successStories.length);
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
      {/* Night Sea Background with improved performance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800" />
        
        {/* Simplified animated elements for better performance */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Moon */}
        <div 
          className="absolute w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full shadow-2xl opacity-80"
          style={{
            top: '15%',
            right: '20%',
            boxShadow: '0 0 50px rgba(255, 255, 200, 0.4)'
          }}
        />

        {/* Water effect */}
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-slate-800 via-blue-900/50 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

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

      {/* Success Stories Carousel */}
      <div className="w-full max-w-6xl mt-16 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-yellow-400 mb-4">Success Stories</h2>
          <p className="text-gray-200 text-lg">Discover how students achieve excellence through dedication and smart studying</p>
        </div>

        <div className="relative bg-black/60 backdrop-blur-lg border border-yellow-500/20 rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative h-96 md:h-80">
            {successStories.map((story, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                  <div className="relative">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50"></div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-4">{story.title}</h3>
                    <p className="text-gray-200 mb-6 leading-relaxed">{story.description}</p>
                    <blockquote className="text-yellow-300 italic text-lg border-l-4 border-yellow-500 pl-4">
                      {story.quote}
                    </blockquote>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/30 rounded-full flex items-center justify-center text-yellow-400 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-yellow-400 scale-125' 
                    : 'bg-yellow-400/30 hover:bg-yellow-400/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center gap-4">
            <h3 className="text-2xl font-bold text-yellow-400">Ready to Start Your Success Journey?</h3>
            <p className="text-gray-200 max-w-2xl">
              Join thousands of students who have transformed their careers through our comprehensive examination platform. 
              Your success story starts with a single step.
            </p>
            <Button 
              onClick={onSwitchToRegister}
              className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
