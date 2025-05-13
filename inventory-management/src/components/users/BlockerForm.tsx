import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { Input } from '../ui/input';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BlockerFormProps {
  onSubmit: (data: BlockerData) => void;
  onClose: () => void;
  initialData?: BlockerData;
  isSubmitting: boolean;
}

export interface BlockerData {
  blockerId?: string;
  userId: number;
  names: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export const BlockerForm: React.FC<BlockerFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<BlockerData>({
    blockerId: initialData?.blockerId || '',
    userId: initialData?.userId || 1,
    names: initialData?.names || '',
    username: initialData?.username || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    address: initialData?.address || '',
    status: initialData?.status || 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (initialData?.blockerId) {
        await axios.put(`${API_BASE_URL}/blockers/${initialData.blockerId}`, formData);
      } else {
        console.log("Sending blocker payload:", formData);
        await axios.post(`${API_BASE_URL}/blockers`, formData);
      }
      
      onSubmit(formData);
      onClose();
    } catch (err) {
      setError('Failed to save blocker. Please try again.');
      console.error('Error saving blocker:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Blocker' : 'Add New Blocker'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocker ID
              </label>
              <input
                type="text"
                name="blockerId"
                value={formData.blockerId}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-gray-50"
                disabled={true}
                placeholder="Auto-generated"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="names"
                value={formData.names}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
              type='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder='email@example.com'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
                disabled={loading}
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || isSubmitting}
            >
              {loading ? 'Saving...' : 'Save Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 