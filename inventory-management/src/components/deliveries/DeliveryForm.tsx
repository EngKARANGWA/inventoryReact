import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { deliveryService, Delivery, CreateDeliveryDTO } from '../../services/deliveryService';

interface DeliveryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  delivery?: Delivery;
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({ isOpen, onClose, onSuccess, delivery }) => {
  const [formData, setFormData] = useState({
    status: delivery?.status || 'pending',
    weight: delivery?.weight?.toString() || '',
    purchaseId: delivery?.purchase?.id || '',
    driverId: delivery?.driver?.id || '',
    notes: delivery?.notes || '',
    deliveredAt: delivery?.deliveredAt || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (delivery) {
      setFormData({
        status: delivery.status,
        weight: delivery.weight.toString(),
        purchaseId: delivery.purchase.id,
        driverId: delivery.driver.id,
        notes: delivery.notes || '',
        deliveredAt: delivery.deliveredAt || '',
      });
    } else {
      setFormData({
        status: 'pending',
        weight: '',
        purchaseId: '',
        driverId: '',
        notes: '',
        deliveredAt: '',
      });
    }
  }, [delivery]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }

    if (!formData.purchaseId) {
      newErrors.purchaseId = 'Purchase is required';
    }

    if (!formData.driverId) {
      newErrors.driverId = 'Driver is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const deliveryData: CreateDeliveryDTO = {
        status: formData.status,
        weight: Number(formData.weight),
        purchaseId: Number(formData.purchaseId),
        driverId: Number(formData.driverId),
        deliveredAt: formData.deliveredAt 
          ? formData.deliveredAt.split('T')[0] // Extract just the YYYY-MM-DD part
          : '', // Use empty string as fallback instead of null
        notes: formData.notes
      };

      if (delivery) {
        await deliveryService.updateDelivery(delivery.id, deliveryData);
        toast.success('Delivery updated successfully');
      } else {
        await deliveryService.createDelivery(deliveryData);
        toast.success('Delivery created successfully');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to save delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {delivery ? 'Edit Delivery' : 'Create Delivery'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase ID
            </label>
            <input
              type="text"
              name="purchaseId"
              value={formData.purchaseId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.purchaseId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.purchaseId && (
              <p className="text-red-500 text-sm mt-1">{errors.purchaseId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver ID
            </label>
            <input
              type="text"
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.driverId ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.driverId && (
              <p className="text-red-500 text-sm mt-1">{errors.driverId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivered At
            </label>
            <input
              type="datetime-local"
              name="deliveredAt"
              value={formData.deliveredAt ? new Date(formData.deliveredAt).toISOString().slice(0, 16) : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (delivery ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm; 