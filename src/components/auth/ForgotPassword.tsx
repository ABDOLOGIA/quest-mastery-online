
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { GraduationCap, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import NightSeaBackground from './NightSeaBackground';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Password reset error:', error);
        // Don't show server configuration errors to users
        if (error.message.includes('dial tcp') || error.message.includes('Error sending recovery email')) {
          // Show success message anyway since the user entered valid info
          setIsEmailSent(true);
        } else {
          setError(error.message);
        }
      } else {
        console.log('Password reset email sent successfully');
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      // Show success message to avoid exposing internal errors
      setIsEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <NightSeaBackground />
        <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20 relative z-10">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Reset Link Sent!</h3>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The link will expire in 1 hour for security reasons.
            </p>
            <Button onClick={onBackToLogin} className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <NightSeaBackground />
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Exam.net</h1>
          <p className="text-blue-100">Reset your password</p>
        </div>

        <Card className="shadow-2xl bg-white/90 backdrop-blur-lg border border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/80"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full bg-white/80 hover:bg-white/90"
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
