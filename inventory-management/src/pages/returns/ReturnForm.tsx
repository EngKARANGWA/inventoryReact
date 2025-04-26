import React, { useState, useEffect } from "react";
import { X, Save, Package } from "lucide-react";
import Select from "react-select";
import {
  CreateReturnData,
  Return,
  returnsService,
} from "../../services/returnsService";

interface ReturnFormData {
  saleId: number;
  returnedQuantity: number;
  note?: string | null;
  status?: string;
}

interface SaleOption {
  id: number;
  referenceNumber: string;
  quantity: string;
  productId: number;
  product?: {
    id: number;
    name: string;
    description: string;
  };
}

interface ReturnFormProps {
  returnToEdit: Return | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({
  returnToEdit,
  onClose,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState<ReturnFormData>({
    saleId: 0,
    returnedQuantity: 0,
    note: "",
    status: "pending",
  });

  const [sales, setSales] = useState<SaleOption[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await returnsService.getSales();

        // Check if response exists and has data
        if (response && response.data) {
          const transformedSales = response.data.map((sale: any) => ({
            id: sale.id,
            referenceNumber: sale.saleReference, // Using the correct field from API
            quantity: sale.quantity,
            productId: sale.productId,
            product: sale.product
              ? {
                  id: sale.product.id,
                  name: sale.product.name,
                  description: sale.product.description,
                }
              : undefined,
          }));
          setSales(transformedSales);
        } else {
          console.warn("No data received from sales API");
          setSales([]);
        }
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Failed to load sales data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set up form when editing
  useEffect(() => {
    if (returnToEdit) {
      setFormData({
        saleId: returnToEdit.saleId,
        returnedQuantity: parseFloat(returnToEdit.returnedQuantity),
        note: returnToEdit.note,
        status: returnToEdit.status || "pending",
      });

      // Find and set selected sale
      if (returnToEdit.sale) {
        setSelectedSale({
          id: returnToEdit.saleId,
          referenceNumber: returnToEdit.sale.referenceNumber,
          quantity: returnToEdit.sale.quantity,
          productId: returnToEdit.productId,
          product: returnToEdit.product,
        });
      }
    }
  }, [returnToEdit]);

  // Validate form
  useEffect(() => {
    const isValid =
      formData.saleId > 0 &&
      formData.returnedQuantity > 0 &&
      (selectedSale
        ? formData.returnedQuantity <= parseFloat(selectedSale.quantity)
        : true);

    setSubmitDisabled(!isValid);
  }, [formData, selectedSale]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "returnedQuantity") {
      const numValue = parseFloat(value) || 0;
      const maxQuantity = selectedSale ? parseFloat(selectedSale.quantity) : 0;

      if (numValue > maxQuantity) {
        setError(
          `Returned quantity cannot exceed original sale quantity (${maxQuantity})`
        );
        return;
      } else {
        setError(null);
      }

      setFormData((prev) => ({ ...prev, returnedQuantity: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData: CreateReturnData = {
        saleId: formData.saleId,
        returnedQuantity: formData.returnedQuantity,
        note: formData.note || undefined,
        status: formData.status,
      };

      if (returnToEdit) {
        await returnsService.updateReturn(returnToEdit.id, submitData);
      } else {
        await returnsService.createReturn(submitData);
      }
      onSubmitSuccess();
    } catch (err: any) {
      console.error("Error submitting return:", err);
      setError(err.message || "Failed to save return. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {returnToEdit ? "Edit Return" : "Create New Return"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Sale Selection Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Sale <span className="text-red-500">*</span>
              </label>
              <Select
                id="saleId"
                name="saleId"
                options={sales.map((sale) => ({
                  value: sale.id,
                  label: `${sale.referenceNumber} - ${
                    sale.product?.name || `Product ID: ${sale.productId}`
                  } (${parseFloat(sale.quantity).toFixed(2)} KG)`,
                }))}
                isLoading={loading && sales.length === 0}
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    const selectedSale = sales.find(
                      (s) => s.id === selectedOption.value
                    );
                    if (selectedSale) {
                      setSelectedSale(selectedSale);
                      setFormData((prev) => ({
                        ...prev,
                        saleId: selectedSale.id,
                        returnedQuantity: 0,
                      }));
                    }
                  }
                }}
                value={
                  selectedSale
                    ? {
                        value: selectedSale.id,
                        label: `${selectedSale.referenceNumber} - ${
                          selectedSale.product?.name ||
                          `Product ID: ${selectedSale.productId}`
                        } (${parseFloat(selectedSale.quantity).toFixed(2)} KG)`,
                      }
                    : null
                }
                placeholder="Search sales by reference or product..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={loading || !!returnToEdit}
              />
              {selectedSale && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <Package size={16} className="mr-1" />
                    Product Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-medium">
                        {selectedSale.product?.name || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Available Quantity:</span>{" "}
                      <span className="font-medium">
                        {parseFloat(selectedSale.quantity).toFixed(2)} KG
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || "pending"}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div> */}

              {/* Returned Quantity Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Returned Quantity (KG) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="returnedQuantity"
                  value={formData.returnedQuantity || ""}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  max={
                    selectedSale ? parseFloat(selectedSale.quantity) : undefined
                  }
                  disabled={!selectedSale}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedSale && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {parseFloat(selectedSale.quantity).toFixed(2)} KG
                  </p>
                )}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="note"
                value={formData.note || ""}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitDisabled}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {returnToEdit ? "Update Return" : "Create Return"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnForm;
