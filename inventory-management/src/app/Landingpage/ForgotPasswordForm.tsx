import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { InputField } from './InputField';
import { requestPasswordReset } from '../../services/authService';
import { toast } from '../../components/ui/toast';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Failed to send reset instructions');
      toast.error('Password reset request failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="text-green-600 rounded-full mx-auto bg-green-100 w-16 h-16 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-600">
          If an account exists with this email, we've sent password reset instructions to:
        </p>
        <p className="font-medium text-gray-800">{email}</p>
        <p className="text-sm text-gray-500 mt-2">
          Please check your inbox and spam folder. The link will expire in 1 hour.
        </p>
        <div className="pt-4">
          <Button
            type="button"
            onClick={onBackToLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-gray-600 mb-4">
        Enter your email address and we'll send you instructions to reset your password.
      </p>
      
      <InputField
        name="email"
        label="Email Address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
        type="email"
        placeholder="Enter your email"
        error={error}
        disabled={isLoading}
        autoFocus
      />
      
      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Reset Instructions'}
      </Button>
      
      <div className="text-center text-sm text-gray-600 mt-4">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}