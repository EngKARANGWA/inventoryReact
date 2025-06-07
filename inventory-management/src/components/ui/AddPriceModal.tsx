import React, { useState, useEffect } from "react";
import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
  id: number;
  name: string;
  description: string | null;
}

interface AddPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPriceAdded: () => void;
}

const AddPriceModal: React.FC<AddPriceModalProps> = ({
  isOpen,
  onClose,
  onPriceAdded,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    productId?: string;
    buyingPrice?: string;
    sellingPrice?: string;
  }>({});

  const [formData, setFormData] = useState({
    productId: "",
    buyingPrice: "",
    sellingPrice: "",
  });

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${API_BASE_URL}/products`
          );
          setProducts(response.data);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: {
      productId?: string;
      buyingPrice?: string;
      sellingPrice?: string;
    } = {};

    if (!formData.productId) {
      validationErrors.productId = "Please select a product";
    }
    if (!formData.buyingPrice || parseFloat(formData.buyingPrice) <= 0) {
      validationErrors.buyingPrice = "Please enter a valid buying price";
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      validationErrors.sellingPrice = "Please enter a valid selling price";
    }
    if (parseFloat(formData.sellingPrice) < parseFloat(formData.buyingPrice)) {
      validationErrors.sellingPrice = "Selling price must be ≥ buying price";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/daily-price`, {
        buyingUnitPrice: parseFloat(formData.buyingPrice),
        sellingUnitPrice: parseFloat(formData.sellingPrice),
        productId: parseInt(formData.productId),
      });
      onPriceAdded();
      onClose();
      setFormData({
        productId: "",
        buyingPrice: "",
        sellingPrice: "",
      });
    } catch (error) {
      console.error("Error adding price:", error);
      alert("Failed to add price. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Price
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buying Price (FRW)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">RWF</span>
                </div>
                <input
                  type="number"
                  name="buyingPrice"
                  value={formData.buyingPrice}
                  onChange={handleChange}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              {errors.buyingPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.buyingPrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (FRW)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">RWF</span>
                </div>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              {errors.sellingPrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.sellingPrice}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Add Price"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPriceModal;
