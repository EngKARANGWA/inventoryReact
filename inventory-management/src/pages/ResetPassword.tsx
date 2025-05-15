import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { InputField } from "../app/Landingpage/InputField";
import { PasswordField } from "../app/Landingpage/PasswordField";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { toast } from '../components/ui/toast';
import { resetPassword } from "../services/authService";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    token: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    token: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });

  // Extract token and email from URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');

    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
    
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
    
    // If missing parameters, show error
    if (!token || !email) {
      setErrors(prev => ({
        ...prev,
        general: 'Invalid reset link. Please request a new password reset.'
      }));
    }
  }, [location.search]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { token: '', email: '', newPassword: '', confirmPassword: '', general: '' };

    if (!formData.token) {
      newErrors.token = 'Reset token is missing';
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(formData.token, formData.email, formData.newPassword);
      setIsSubmitted(true);
      toast.success('Password has been reset successfully');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to reset password. Please try again.'
      }));
      toast.error('Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-indigo-600 p-4">
          <h1 className="text-2xl font-bold text-center text-white">Inventory System</h1>
        </div>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
            Reset Your Password
          </h2>
          
          {isSubmitted ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 rounded-full mx-auto bg-green-100 w-16 h-16 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-800 font-medium">
                Your password has been reset successfully!
              </p>
              <p className="text-gray-600">
                You can now log in with your new password.
              </p>
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {errors.general}
                </div>
              )}
              
              <InputField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                type="email"
                placeholder="Enter your email"
                error={errors.email}
                disabled={isLoading || !!location.search}
              />
              
              <PasswordField
                name="newPassword"
                label="New Password"
                value={formData.newPassword}
                onChange={handleInputChange}
                error={errors.newPassword}
                disabled={isLoading}
              />
              
              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                disabled={isLoading}
              />
              
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
              
              <div className="text-center text-sm text-gray-600 mt-4">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}