import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';
import { login } from '../../services/authService';
import { toast } from '../../components/ui/toast';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    usernameOrEmail: '',
    password: '',
    general: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { usernameOrEmail: '', password: '', general: '' };

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const response = await login(formData.usernameOrEmail, formData.password);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success('Login successful');
      
      if (response.user.roles.includes('ADMIN')) {
        navigate('/dashboard');
      } else if (response.user.roles.includes('CASHIER')) {
        navigate('/cashier/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors(prev => ({
        ...prev,
        general: error?.message || 'Invalid username/email or password'
      }));
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <InputField
        name="usernameOrEmail"
        label="Username or Email"
        value={formData.usernameOrEmail}
        onChange={handleInputChange}
        placeholder="Enter your username or email"
        error={errors.usernameOrEmail}
        disabled={isLoading}
        autoFocus
      />
      
      <PasswordField
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        disabled={isLoading}
      />
      
      {errors.general && (
        <div className="text-sm text-red-600 font-medium">{errors.general}</div>
      )}
      
      <div className="flex justify-end">
        <button 
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Forgot password?
        </button>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}