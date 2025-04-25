import React from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';

interface SaleFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  editingSale: any;
  formData: any;
  setFormData: (data: any) => void;
  products: any[];
  salers: any[];
  clients: any[];
  blockers: any[];
  setProductsSearch: (search: string) => void;
  setSalersSearch: (search: string) => void;
  setClientsSearch: (search: string) => void;
  setBlockersSearch: (search: string) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  showAddForm,
  setShowAddForm,
  editingSale,
  formData,
  setFormData,
  products,
  salers,
  clients,
  blockers,
  setProductsSearch,
  setSalersSearch,
  setClientsSearch,
  setBlockersSearch,
  handleFormSubmit,
  isSubmitting
}) => {
  if (!showAddForm) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingSale ? "Edit Sale" : "Create New Sale"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Select */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <Select
                id="productId"
                name="productId"
                options={products.map(p => ({ value: p.id, label: p.name }))}
                isLoading={!products.length}
                onInputChange={(value) => setProductsSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    productId: selectedOption?.value.toString() || ""
                  }));
                }}
                value={products
                  .filter(p => p.id.toString() === formData.productId)
                  .map(p => ({ value: p.id, label: p.name }))[0]}
                placeholder="Search and select product..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!editingSale}
              />
            </div>

            {/* Saler Select */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saler <span className="text-red-500">*</span>
              </label>
              <Select
                id="salerId"
                name="salerId"
                options={salers.map(s => ({ value: s.id, label: s.name }))}
                isLoading={!salers.length}
                onInputChange={(value) => setSalersSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    salerId: selectedOption?.value.toString() || ""
                  }));
                }}
                value={salers
                  .filter(s => s.id.toString() === formData.salerId)
                  .map(s => ({ value: s.id, label: s.name }))[0]}
                placeholder="Search and select saler..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!editingSale}
              />
            </div>

            {/* Client Select */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client (Optional)
              </label>
              <Select
                id="clientId"
                name="clientId"
                options={clients.map(c => ({ value: c.id, label: c.name }))}
                isLoading={!clients.length}
                onInputChange={(value) => setClientsSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    clientId: selectedOption?.value.toString() || ""
                  }));
                }}
                value={clients
                  .filter(c => c.id.toString() === formData.clientId)
                  .map(c => ({ value: c.id, label: c.name }))[0]}
                placeholder="No client"
                className="basic-single"
                classNamePrefix="select"
                isClearable
                isDisabled={isSubmitting}
              />
            </div>

            {/* Blocker Select */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocker (Optional)
              </label>
              <Select
                id="blockerId"
                name="blockerId"
                options={blockers.map(b => ({ value: b.id, label: b.name }))}
                isLoading={!blockers.length}
                onInputChange={(value) => setBlockersSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    blockerId: selectedOption?.value.toString() || ""
                  }));
                }}
                value={blockers
                  .filter(b => b.id.toString() === formData.blockerId)
                  .map(b => ({ value: b.id, label: b.name }))[0]}
                placeholder="No blocker"
                className="basic-single"
                classNamePrefix="select"
                isClearable
                isDisabled={isSubmitting}
              />
            </div>

            {/* Quantity Input */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
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

            {/* Unit Price Input */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (RWF) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Date Input */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Expected Delivery Date Input */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
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
                !formData.salerId ||
                !formData.quantity ||
                !formData.unitPrice ||
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
                  {editingSale ? "Updating..." : "Creating..."}
                </>
              ) : editingSale ? (
                "Update Sale"
              ) : (
                "Create Sale"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};