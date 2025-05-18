// components/PasswordChangePrompt.tsx
import React, { useState } from 'react';
import api from '../../services/authService';
import { toast } from 'react-toastify';

interface PasswordChangePromptProps {
  user: {
    id: number;
    email: string;
    isDefaultPassword: boolean;
  };
}

export const PasswordChangePrompt: React.FC<PasswordChangePromptProps> = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    current: '',
    new: '',
    confirm: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Don't show if not needed
  if (!user?.isDefaultPassword || user?.email === 'admin@admin.com') {
    return null;
  }

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      current: '',
      new: '',
      confirm: '',
      general: ''
    };

    if (!currentPassword) {
      newErrors.current = 'Current password is required';
      isValid = false;
    }

    if (!newPassword) {
      newErrors.new = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.new = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('auth/change-password', {
        currentPassword,
        newPassword
      });

      // Update user in localStorage
      const updatedUser = { ...user, isDefaultPassword: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Password changed successfully');
      // Trigger a reload to reflect changes
      window.location.reload();
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || 'Failed to change password'
      }));
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Change Your Password</h2>
          <p className="text-gray-600 mt-1">
            You are currently using a default password. Please change it to a secure one.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setErrors(prev => ({ ...prev, current: '' }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.current && (
              <p className="text-sm text-red-600 mt-1">{errors.current}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setErrors(prev => ({ ...prev, new: '' }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.new && (
              <p className="text-sm text-red-600 mt-1">{errors.new}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors(prev => ({ ...prev, confirm: '' }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirm && (
              <p className="text-sm text-red-600 mt-1">{errors.confirm}</p>
            )}
          </div>
          
          {errors.general && (
            <p className="text-sm text-red-600">{errors.general}</p>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-white ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};