import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Transfer } from "../../services/transferService";
import { warehouseService } from "../../services/warehouseServices";
import { X } from "lucide-react";

interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  managerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  manager: any | null;
  scaleMonitor: any | null;
}

interface TransferFormProps {
  formData: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    driverId: string;
    quantity: string;
    note: string;
  };
  editingTransfer: Transfer | null;
  isSubmitting: boolean;
  productsLoading: boolean;
  driversLoading: boolean;
  productsOptions: { value: number; label: string }[];
  driversOptions: { value: number; label: string }[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSelectChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({
  formData,
  editingTransfer,
  isSubmitting,
  productsLoading,
  driversLoading,
  productsOptions,
  driversOptions,
  onChange,
  onSelectChange,
  onSubmit,
  onClose,
}) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const warehouses = await warehouseService.getAllWarehouses();
        setWarehouses(warehouses);
      } catch (error) {
        console.error("Failed to load warehouses:", error);
      } finally {
        setWarehousesLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingTransfer ? "Edit Transfer" : "Create New Transfer"}
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
          <div className="grid grid-cols-1 gap-6">
            {/* Product Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <Select
                id="productId"
                name="productId"
                options={productsOptions}
                isLoading={productsLoading}
                onChange={(selectedOption) => {
                  onSelectChange(
                    "productId",
                    selectedOption?.value.toString() || ""
                  );
                }}
                value={productsOptions.find(
                  (option) => option.value.toString() === formData.productId
                )}
                placeholder="Search and select product..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!editingTransfer}
              />
              {!productsLoading && productsOptions.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No products available. Please add products first.
                </p>
              )}
            </div>

            {/* From Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Warehouse <span className="text-red-500">*</span>
              </label>
              {warehousesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
                  Loading warehouses...
                </div>
              ) : (
                <select
                  name="fromWarehouseId"
                  value={formData.fromWarehouseId}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting || !!editingTransfer}
                >
                  <option value="">Select source warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.location})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* To Warehouse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Warehouse <span className="text-red-500">*</span>
              </label>
              {warehousesLoading ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
                  Loading warehouses...
                </div>
              ) : (
                <select
                  name="toWarehouseId"
                  value={formData.toWarehouseId}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting || !!editingTransfer}
                >
                  <option value="">Select destination warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.location})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Driver Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver <span className="text-red-500">*</span>
              </label>
              <Select
                id="driverId"
                name="driverId"
                options={driversOptions}
                isLoading={driversLoading}
                onChange={(selectedOption) => {
                  onSelectChange(
                    "driverId",
                    selectedOption?.value.toString() || ""
                  );
                }}
                value={driversOptions.find(
                  (option) => option.value.toString() === formData.driverId
                )}
                placeholder="Search and select driver..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!editingTransfer}
              />
              {!driversLoading && driversOptions.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No drivers available. Please add drivers first.
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/,/g, "");
                  if (!isNaN(Number(rawValue))) {
                    onChange({
                      ...e,
                      target: {
                        ...e.target,
                        name: "quantity",
                        value: rawValue,
                      },
                    });
                  }
                }}
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
                onChange={onChange}
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
                !formData.productId ||
                !formData.fromWarehouseId ||
                !formData.toWarehouseId ||
                !formData.driverId ||
                !formData.quantity
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
                  {editingTransfer ? "Updating..." : "Creating..."}
                </>
              ) : editingTransfer ? (
                "Update Transfer"
              ) : (
                "Create Transfer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;