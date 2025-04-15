import React, { useState} from 'react';
import { X } from 'lucide-react';

import {  Cashier } from '../../services/userService';

interface CashierFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: Cashier;
  isSubmitting?: boolean;
}

const CashierForm: React.FC<CashierFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    cashierId: initialData?.cashierId || '',
    userId: initialData?.userId || '',
    user: {
      username: initialData?.user?.username || '',
      email: initialData?.user?.email || '',
      accountStatus: initialData?.user?.accountStatus || 'active',
      profile: {
        names: initialData?.user?.profile?.names || '',
        phoneNumber: initialData?.user?.profile?.phoneNumber || '',
        address: initialData?.user?.profile?.address || '',
        status: initialData?.user?.profile?.status || 'active'
      }
    }
  });

  const [errors, setErrors] = useState({
    cashierId: '',
    userId: '',
    username: '',
    email: '',
    names: '',
    phoneNumber: '',
    address: '',
    general: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          [parent as keyof typeof prev.user]: {
            ...(prev.user[parent as keyof typeof prev.user] as Record<string, any>),
            [child as string]: value
          }
        }
      }));
    } else if (name.includes('profile.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        user: {
          ...prev.user,
          profile: {
            ...prev.user.profile,
            [field as keyof typeof prev.user.profile]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as keyof typeof prev]: value
      }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      cashierId: '',
      userId: '',
      username: '',
      email: '',
      names: '',
      phoneNumber: '',
      address: '',
      general: ''
    };
    
    let isValid = true;
    
    if (!formData.cashierId) {
      newErrors.cashierId = 'Cashier ID is required';
      isValid = false;
    }
    
    if (!formData.userId) {
      newErrors.userId = 'User ID is required';
      isValid = false;
    }
    
    if (!formData.user.username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    
    if (!formData.user.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.user.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.user.profile.names) {
      newErrors.names = 'Full name is required';
      isValid = false;
    }
    
    if (!formData.user.profile.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    }
    
    if (!formData.user.profile.address) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Format data for API
      const payload = {
        cashierId: formData.cashierId,
        userId: formData.userId,
        user: {
          username: formData.user.username,
          email: formData.user.email,
          accountStatus: formData.user.accountStatus,
          profile: {
            names: formData.user.profile.names,
            phoneNumber: formData.user.profile.phoneNumber,
            address: formData.user.profile.address,
            status: formData.user.profile.status
          }
        }
      };
      
      onSubmit(payload);
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Failed to submit form'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm z-40" 
        onClick={onClose} 
      />
      
      <div className="fixed inset-0 flex items-center justify-center z-50 px-4 overflow-y-auto">
        <div 
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 my-4" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {initialData ? 'Edit Cashier' : 'Add New Cashier'}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cashier Information</h3>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="cashierId">
                  Cashier ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cashierId"
                  name="cashierId"
                  value={formData.cashierId}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.cashierId ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter cashier ID"
                  required
                />
                {errors.cashierId && (
                  <p className="text-red-500 text-sm mt-1">{errors.cashierId}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="userId">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.userId ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter user ID"
                  required
                />
                {errors.userId && (
                  <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
                )}
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">User Information</h3>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="user.username">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="user.username"
                  name="user.username"
                  value={formData.user.username}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.username ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter username"
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="user.email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="user.email"
                  name="user.email"
                  value={formData.user.email}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="user.accountStatus">
                  Account Status
                </label>
                <select
                  id="user.accountStatus"
                  name="user.accountStatus"
                  value={formData.user.accountStatus}
                  onChange={handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pt-2">Profile Information</h3>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="profile.names">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="profile.names"
                  name="profile.names"
                  value={formData.user.profile.names}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.names ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter full name"
                  required
                />
                {errors.names && (
                  <p className="text-red-500 text-sm mt-1">{errors.names}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="profile.phoneNumber">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="profile.phoneNumber"
                  name="profile.phoneNumber"
                  value={formData.user.profile.phoneNumber}
                  onChange={handleChange}
                  className={`shadow-sm bg-gray-50 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter phone number"
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="profile.address">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="profile.address"
                  name="profile.address"
                  value={formData.user.profile.address}
                  onChange={handleChange}
                  rows={3}
                  className={`shadow-sm bg-gray-50 border ${errors.address ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Enter address"
                  required
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="profile.status">
                  Status
                </label>
                <select
                  id="profile.status"
                  name="profile.status"
                  value={formData.user.profile.status}
                  onChange={handleChange}
                  className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${(isSubmitting || loading) ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {initialData ? 'Updating...' : 'Adding...'}
                  </div>
                ) : initialData ? 'Update Cashier' : 'Add Cashier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CashierForm; 