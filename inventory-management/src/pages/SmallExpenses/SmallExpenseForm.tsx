import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import {
  SmallExpense,
  createExpense,
  updateExpense,
} from "../../services/smallExpenseService";

interface Props {
  initialData?: SmallExpense | null;
  onSubmit: () => void;
  onClose: () => void;
}

type ExpenseInput = {
  operation: string;
  amount: number;
  direction: "in" | "out";
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  description?: string;
};

const defaultExpense: ExpenseInput = {
  operation: "",
  amount: 0,
  direction: "out",
  paymentMethod: "cash",
  description: "",
};

const SmallExpenseForm: React.FC<Props> = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<ExpenseInput>(defaultExpense);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        operation: initialData.operation,
        amount: parseFloat(initialData.amount.toString()),
        direction: initialData.direction,
        paymentMethod: initialData.paymentMethod,
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (initialData) {
        await updateExpense(initialData.id, formData);
        toast.success("Expense updated successfully");
      } else {
        await createExpense(formData);
        toast.success("Expense created successfully");
      }
      onSubmit();
      onClose();
    } catch (error: any) {
      console.error("Error saving expense:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to save expense. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Expense" : "Create New Expense"}
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Operation field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="operation"
                value={formData.operation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            {/* Amount field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                disabled={isSubmitting}
              />
            </div>

            {/* Direction field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction <span className="text-red-500">*</span>
              </label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              >
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </div>

            {/* Payment Method field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit buttons */}
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
              disabled={isSubmitting || !formData.operation || !formData.amount}
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
                  {initialData ? "Updating..." : "Creating..."}
                </>
              ) : initialData ? (
                "Update Expense"
              ) : (
                "Create Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmallExpenseForm;