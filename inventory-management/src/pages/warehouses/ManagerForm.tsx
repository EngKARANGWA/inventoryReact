import React from "react";
import { X } from "lucide-react";
import { ManagerFormProps } from "./types";

const ManagerForm: React.FC<ManagerFormProps> = ({
  stockKeepers,
  loadingStockKeepers,
  newManagerId,
  isSubmittingManager,
  onChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Change Warehouse Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmittingManager}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Manager <span className="text-red-500">*</span>
              </label>
              {loadingStockKeepers ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <select
                  id="newManagerId"
                  name="newManagerId"
                  value={newManagerId}
                  onChange={onChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmittingManager}
                >
                  <option value="">Select a manager</option>
                  {stockKeepers.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.user.profile?.names || sk.user.username}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Select a StockKeeper to assign as manager
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmittingManager}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isSubmittingManager ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={isSubmittingManager || !newManagerId}
            >
              {isSubmittingManager ? (
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
                  Changing...
                </>
              ) : (
                "Change Manager"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerForm;