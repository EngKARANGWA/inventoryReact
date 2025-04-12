import React, { useState, useEffect } from 'react';
import { X, Search} from 'lucide-react';
import { toast } from 'react-toastify';
import { paymentService, CreatePaymentDTO, Payment } from '../../services/paymentService';
import { productService, Product } from '../../services/productService';
import axios from 'axios';

interface Driver {
  id: number;
  driverId: string;
  user: {
    profile: {
      names: string;
    };
  };
}

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment?: Payment;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ isOpen, onClose, onSuccess, payment }) => {
  const [formData, setFormData] = useState({
    payableType: 'purchase' as 'purchase' | 'sale',
    purchaseId: '',
    saleId: '',
    amount: '',
    paymentMethod: 'mobile_money',
    paymentReference: '',
    transactionReference: '',
    paidAt: '',
    status: 'pending'
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (payment) {
      setFormData({
        payableType: payment.payableType as 'purchase' | 'sale',
        purchaseId: payment.purchaseId?.toString() || '',
        saleId: payment.saleId?.toString() || '',
        amount: payment.amount.toString(),
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference || '',
        transactionReference: payment.transactionReference || '',
        paidAt: payment.paidAt || '',
        status: payment.status
      });
    }
  }, [payment]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, driversData] = await Promise.all([
          productService.getAllProducts() as Promise<Product[]>,
          axios.get('https://test.gvibyequ.a2hosted.com/api/drivers').then(res => res.data)
        ]);
        setProducts(productsData);
        setDrivers(driversData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.id.toString().includes(productSearch)
  );

  const filteredDrivers = drivers.filter(driver =>
    driver.user.profile.names.toLowerCase().includes(driverSearch.toLowerCase()) ||
    driver.driverId.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.payableType) {
      newErrors.payableType = 'Payable type is required';
    }

    if (formData.payableType === 'purchase' && !formData.purchaseId) {
      newErrors.purchaseId = 'Purchase ID is required';
    } else if (formData.payableType === 'sale' && !formData.saleId) {
      newErrors.saleId = 'Sale ID is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Amount must be a number';
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.paymentReference) {
      newErrors.paymentReference = 'Payment reference is required';
    }

    if (!formData.transactionReference) {
      newErrors.transactionReference = 'Transaction reference is required';
    }

    if (!formData.paidAt) {
      newErrors.paidAt = 'Paid date is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
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
      const paymentData: CreatePaymentDTO = {
        status: formData.status,
        payableType: formData.payableType,
        purchaseId: formData.purchaseId ? Number(formData.purchaseId) : undefined,
        saleId: formData.saleId ? Number(formData.saleId) : undefined,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        transactionReference: formData.transactionReference,
        paidAt: formData.paidAt
      };

      if (payment) {
        await paymentService.updatePayment(payment.id, paymentData);
        toast.success('Payment updated successfully');
      } else {
        await paymentService.createPayment(paymentData);
        toast.success('Payment created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Payment submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to save payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductSelect = (product: Product) => {
    setFormData(prev => ({ ...prev, purchaseId: product.id.toString() }));
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleDriverSelect = (driver: Driver) => {
    setFormData(prev => ({ ...prev, saleId: driver.id.toString() }));
    setDriverSearch(driver.user.profile.names);
    setShowDriverDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {payment ? 'Edit Payment' : 'Create Payment'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payable Type
            </label>
            <select
              name="payableType"
              value={formData.payableType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.payableType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
            {errors.payableType && (
              <p className="text-red-500 text-sm mt-1">{errors.payableType}</p>
            )}
          </div>

          {formData.payableType === 'purchase' ? (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search product by name or ID"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.purchaseId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              {showProductDropdown && filteredProducts.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">ID: {product.id}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.purchaseId && (
                <p className="text-red-500 text-sm mt-1">{errors.purchaseId}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={driverSearch}
                  onChange={(e) => {
                    setDriverSearch(e.target.value);
                    setShowDriverDropdown(true);
                  }}
                  onFocus={() => setShowDriverDropdown(true)}
                  placeholder="Search driver by name or ID"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.saleId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              {showDriverDropdown && filteredDrivers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredDrivers.map(driver => (
                    <div
                      key={driver.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleDriverSelect(driver)}
                    >
                      <div className="font-medium">{driver.user.profile.names}</div>
                      <div className="text-sm text-gray-500">ID: {driver.driverId}</div>
                    </div>
                  ))}
                </div>
              )}
              {errors.saleId && (
                <p className="text-red-500 text-sm mt-1">{errors.saleId}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Reference
            </label>
            <input
              type="text"
              name="paymentReference"
              value={formData.paymentReference}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.paymentReference ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.paymentReference && (
              <p className="text-red-500 text-sm mt-1">{errors.paymentReference}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Reference
            </label>
            <input
              type="text"
              name="transactionReference"
              value={formData.transactionReference}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.transactionReference ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.transactionReference && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionReference}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Date
            </label>
            <input
              type="datetime-local"
              name="paidAt"
              value={formData.paidAt}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.paidAt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.paidAt && (
              <p className="text-red-500 text-sm mt-1">{errors.paidAt}</p>
            )}
          </div>

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
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status}</p>
            )}
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
              {isSubmitting ? 'Saving...' : (payment ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;