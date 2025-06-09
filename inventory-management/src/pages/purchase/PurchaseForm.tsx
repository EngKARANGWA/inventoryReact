import React from "react";
import { X } from "lucide-react";
import { Product, User } from "../../services/purchaseService";

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    userId: string;
    productId: string;
    weight: string;
    unitPrice: string;
    description: string;
    expectedDeliveryDate: string;
  };
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  products: Product[];
  users: User[];
  loadingProducts: boolean;
  loadingUsers: boolean;
  isSubmitting: boolean;
  editingPurchase: boolean;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  products,
  users,
  loadingProducts,
  loadingUsers,
  isSubmitting,
  editingPurchase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingPurchase ? "Edit Purchase" : "Create New Purchase"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supplier Select */}
            <div className="col-span-1">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Supplier <span className="text-red-500">*</span>
              </label>
              <select
                id="userId"
                name="userId"
                value={formData.userId}
                onChange={onFormChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  editingPurchase ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                required
                disabled={isSubmitting || loadingUsers || editingPurchase}
              >
                <option value="">
                  {loadingUsers
                    ? "Loading suppliers..."
                    : "Select a supplier"}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.profile?.names || "Unknown Supplier"} (
                    {user.id})
                  </option>
                ))}
              </select>
              {!loadingUsers && users.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No suppliers available. Please add suppliers first.
                </p>
              )}
            </div>

            {/* Product Select */}
            <div className="col-span-1">
              <label
                htmlFor="productId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={onFormChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  editingPurchase ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                required
                disabled={isSubmitting || loadingProducts || editingPurchase}
              >
                <option value="">
                  {loadingProducts ? "Loading products..." : "Select a product"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.type})
                    {product.description && ` - ${product.description}`}
                  </option>
                ))}
              </select>
              {!loadingProducts && products.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No products available. Please add products first.
                </p>
              )}
            </div>

            {/* Weight Input */}
            <div className="col-span-1">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weight (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Add Unit Price Input */}
            <div className="col-span-1">
              <label
                htmlFor="unitPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit Price (RWF/Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Expected Delivery Date */}
            <div className="col-span-1">
              <label
                htmlFor="expectedDeliveryDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={onFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={onFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                placeholder="Enter additional details about this purchase..."
              />
            </div>
          </div>

          {/* Form buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={
                isSubmitting ||
                loadingProducts ||
                loadingUsers ||
                (products.length === 0 && !editingPurchase) ||
                (users.length === 0 && !editingPurchase)
              }
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
                  {editingPurchase ? "Updating..." : "Creating..."}
                </>
              ) : editingPurchase ? (
                "Update Purchase"
              ) : (
                "Create Purchase"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;
