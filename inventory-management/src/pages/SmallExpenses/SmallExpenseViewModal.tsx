import React from "react";
import { SmallExpense } from "../../services/smallExpenseService";
import { formatNumber } from "../../utils/formatUtils";
import { X, ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  expense: SmallExpense | null;
  onClose: () => void;
}

const SmallExpenseViewModal: React.FC<Props> = ({ expense, onClose }) => {
  if (!expense) return null;

  const getDirectionIcon = (direction: string) => {
    return direction === "in" ? (
      <ArrowDown className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Small Expense Details - {expense.operation}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Operation</p>
              <p className="text-lg font-semibold">{expense.operation}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Amount</p>
              <p className="text-lg font-semibold">
                {formatNumber(expense.amount)} RWF
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Direction</p>
              <p className="text-lg font-semibold flex items-center">
                {getDirectionIcon(expense.direction)}
                <span className="ml-1 capitalize">{expense.direction}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium capitalize">
                      {expense.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">
                      {new Date(expense.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3">
                Additional Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm font-medium">
                    {expense.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {/* <button
            className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 flex items-center mr-2"
          >
            <FileTextIcon className="w-4 h-4 mr-2" />
            Export to PDF
          </button> */}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmallExpenseViewModal;