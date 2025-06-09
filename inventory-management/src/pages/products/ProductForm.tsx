import React, { useState } from 'react';
import { X, RefreshCw, Package } from 'lucide-react';
import { Product } from '../../services/productService';
import { toast } from 'react-toastify';

interface ProductFormProps {
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => Promise<void>;
  onClose: () => void;
  initialData?: Product;
  isSubmitting?: boolean;
  onRefresh?: () => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isSubmitting = false,
  onRefresh,
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'finished_product',
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    type: '',
    general: ''
  });

  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      description: '',
      type: '',
      general: ''
    };

    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    } else if (formData.name.length < 2 || formData.name.length > 100) {
      newErrors.name = 'Product name must be between 2 and 100 characters';
      isValid = false;
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
      isValid = false;
    }

    if (!['raw_material', 'finished_product', 'raw_and_finished'].includes(formData.type)) {
      newErrors.type = 'Invalid product type';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onRefresh();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type
      });
    } catch (error: any) {
      console.error('Submission error:', error);
      
      // Handle specific backend validation errors
      if (error.response?.data?.code === 'DUPLICATE_PRODUCT') {
        setErrors(prev => ({
          ...prev,
          name: error.response.data.message || 'Product with this name already exists',
          general: error.response.data.message || 'Product with this name already exists'
        }));
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.response.data.errors;
        const newErrors = {
          name: backendErrors.find((e: any) => e.path === 'name')?.message || '',
          description: backendErrors.find((e: any) => e.path === 'description')?.message || '',
          type: backendErrors.find((e: any) => e.path === 'type')?.message || '',
          general: backendErrors[0]?.message || 'Failed to submit form'
        };
        setErrors(newErrors);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to submit form';
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
      
      toast.error(error.response?.data?.message || error.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500" />
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h2>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={handleRefresh}
                className={`flex items-center text-gray-500 hover:text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh Data"
                disabled={isRefreshing || loading}
              >
                <RefreshCw size={18} className="mr-1" />
                <span className="text-sm">Refresh</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
              placeholder="Enter product name (2-100 characters)"
              minLength={2}
              maxLength={100}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            >
              <option value="finished_product">Finished Product</option>
              <option value="raw_material">Raw Material</option>
              <option value="raw_and_finished">Finished and Raw Material</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
              disabled={loading}
              placeholder="Enter product description (optional, max 500 characters)"
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-w-24"
              disabled={loading || isSubmitting}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                initialData ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;