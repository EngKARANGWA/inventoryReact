import React from "react";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmationModalProps {
  returnId: number;
  onClose: () => void;
  onConfirm: (returnId: number) => void;
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  returnId,
  onClose,
  onConfirm,
  isSubmitting,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h2 className="text-xl font-semibold">Confirm Delete</h2>
        </div>
        
        <p className="mb-6 text-gray-600">
          Are you sure you want to delete this return? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(returnId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            disabled={isSubmitting}
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
                Deleting...
              </>
            ) : (
              "Delete Return"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 