import React from "react";
import {
  Package,
  X,
  AlertTriangle,
  Calendar as CalendarIcon,
  Gift,
  Recycle,
  Truck,
  Skull,
  Info,
} from "lucide-react";

interface DisposalFormProps {
  editingDisposal: any;
  formData: any;
  isSubmitting: boolean;
  loadingProducts: boolean;
  loadingWarehouses: boolean;
  loadingPrices: boolean;
  products: any[];
  warehouses: any[];
  prices: any[];
  selectedProduct: number | null;
  handleFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  setShowAddForm: (show: boolean) => void;
}

const methodOptions = [
  {
    value: "damaged",
    label: "Damaged",
    icon: <AlertTriangle className="w-4 h-4 mr-2" />,
  },
  {
    value: "expired",
    label: "Expired",
    icon: <CalendarIcon className="w-4 h-4 mr-2" />,
  },
  {
    value: "destroyed",
    label: "Destroyed",
    icon: <Skull className="w-4 h-4 mr-2" />,
  },
  {
    value: "donated",
    label: "Donated",
    icon: <Gift className="w-4 h-4 mr-2" />,
  },
  {
    value: "recycled",
    label: "Recycled",
    icon: <Recycle className="w-4 h-4 mr-2" />,
  },
  {
    value: "returned_to_supplier",
    label: "Returned to Supplier",
    icon: <Truck className="w-4 h-4 mr-2" />,
  },
  {
    value: "other",
    label: "Other",
    icon: <Package className="w-4 h-4 mr-2" />,
  },
];

const DisposalForm: React.FC<DisposalFormProps> = ({
  editingDisposal,
  formData,
  isSubmitting,
  loadingProducts,
  loadingWarehouses,
  products,
  warehouses,
  prices,
  handleFormChange,
  handleFormSubmit,
  setShowAddForm,
}) => {
  const estimatedPrice = prices[0]?.buyingUnitPrice;
  const showPriceField = !editingDisposal || formData.unitPrice !== undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingDisposal ? "Edit Disposal" : "Create New Disposal"}
          </h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Product Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !!editingDisposal || loadingProducts}
              >
                <option value="">
                  {loadingProducts
                    ? "Loading products..."
                    : "Select a product"}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {!loadingProducts && products.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No products available. Please add products first.
                </p>
              )}
            </div>

            {/* Warehouse Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !!editingDisposal || loadingWarehouses}
              >
                <option value="">
                  {loadingWarehouses
                    ? "Loading warehouses..."
                    : "Select a warehouse"}
                </option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.location})
                  </option>
                ))}
              </select>
              {!loadingWarehouses && warehouses.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No warehouses available. Please add warehouses first.
                </p>
              )}
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Unit Price Input - Only show if creating new or has unit price */}
            {showPriceField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price (Rwf)
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice || ''}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="Leave empty to use estimated price"
                />
                {estimatedPrice !== undefined && estimatedPrice !== null && (
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <Info className="w-4 h-4 mr-1" />
                    Estimated price: ${Number(estimatedPrice).toFixed(2)} per unit
                  </div>
                )}
              </div>
            )}

            {/* Method Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method <span className="text-red-500">*</span>
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              >
                {methodOptions.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
                placeholder="Additional information about this disposal..."
              />
            </div>
          </div>

          {/* Form buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
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
                !formData.productId ||
                !formData.warehouseId ||
                !formData.quantity ||
                !formData.method ||
                !formData.date
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
                  {editingDisposal ? "Updating..." : "Creating..."}
                </>
              ) : editingDisposal ? (
                "Update Disposal"
              ) : (
                "Create Disposal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisposalForm;