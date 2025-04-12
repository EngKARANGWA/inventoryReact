import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { deliveryService, Delivery, CreateDeliveryDTO, Driver, Purchase } from '../../services/deliveryService';
//import { productService, Product } from '../../services/productService';
import axios from 'axios';
import Select from 'react-select';

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
    purchaseId: delivery?.purchase?.id?.toString() || '',
    driverId: delivery?.driver?.id?.toString() || '',
    notes: delivery?.notes || '',
    deliveredAt: delivery?.deliveredAt || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  
  useEffect(() => {
    if (delivery) {
      setFormData({
        status: delivery.status,
        weight: delivery.weight.toString(),
        purchaseId: delivery.purchase.id.toString(),
        driverId: delivery.driver.id.toString(),
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [purchasesData, driversData] = await Promise.all([
          axios.get<Purchase[]>('https://test.gvibyequ.a2hosted.com/api/purchases').then(res => res.data),
          axios.get<Driver[]>('https://test.gvibyequ.a2hosted.com/api/drivers').then(res => res.data)
        ]);
        setPurchases(purchasesData);
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

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
          ? formData.deliveredAt.split('T')[0]
          : '',
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
      onClose();
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

  const filteredPurchases = purchases.filter(purchase =>
    purchase.purchaseReference.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    purchase.id.toString().includes(purchaseSearch)
  );

  const filteredDrivers = drivers.filter(driver =>
    driver.user.profile.names.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.driverId.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const purchaseOptions = filteredPurchases.map(purchase => ({
    value: purchase.id,
    label: `${purchase.purchaseReference} - ${purchase.description} (${purchase.weight} KG)`,
  }));

  const driverOptions = filteredDrivers.map(driver => ({
    value: driver.id,
    label: `${driver.driverId} - ${driver.user.profile.names}`,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {delivery ? 'Edit Delivery' : 'Record New Delivery'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
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
              Purchase <span className="text-red-500">*</span>
            </label>
            <Select
              id="purchaseId"
              name="purchaseId"
              options={purchaseOptions}
              value={purchaseOptions.find(option => option.value.toString() === formData.purchaseId)}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFormData(prev => ({
                    ...prev,
                    purchaseId: selectedOption.value.toString()
                  }));
                }
              }}
              onInputChange={(value) => setPurchaseSearch(value)}
              placeholder="Search and select purchase..."
              className="basic-single"
              classNamePrefix="select"
              isClearable
              required
            />
            {errors.purchaseId && (
              <p className="text-red-500 text-sm mt-1">{errors.purchaseId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Driver <span className="text-red-500">*</span>
            </label>
            <Select
              id="driverId"
              name="driverId"
              options={driverOptions}
              value={driverOptions.find(option => option.value.toString() === formData.driverId)}
              onChange={(selectedOption) => {
                if (selectedOption) {
                  setFormData(prev => ({
                    ...prev,
                    driverId: selectedOption.value.toString()
                  }));
                }
              }}
              onInputChange={(value) => setDriverSearch(value)}
              placeholder="Search and select driver..."
              className="basic-single"
              classNamePrefix="select"
              isClearable
              required
            />
            {errors.driverId && (
              <p className="text-red-500 text-sm mt-1">{errors.driverId}</p>
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
              min="0.01"
              step="0.01"
              required
            />
            {errors.weight && (
              <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Date
            </label>
            <input
              type="datetime-local"
              name="deliveredAt"
              value={formData.deliveredAt}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                delivery ? 'Update Delivery' : 'Record Delivery'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm; 