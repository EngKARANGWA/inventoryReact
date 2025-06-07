import React, { useState } from "react";
import { X } from "lucide-react";

interface UserStatusModalProps {
  userId: string | number;
  username: string;
  currentStatus: string;
  onClose: () => void;
  onUpdateStatus: (userId: string | number, status: string) => Promise<void>;
}

const UserStatusModal: React.FC<UserStatusModalProps> = ({
  userId,
  username,
  currentStatus,
  onClose,
  onUpdateStatus,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || "active");
  const [success, setSuccess] = useState(false);
  
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-red-100 text-red-800" },
    { value: "suspended", label: "Suspended", color: "bg-orange-100 text-orange-800" },
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  ];

  const handleUpdateStatus = async () => {
    try {
      setIsSubmitting(true);
      await onUpdateStatus(userId, selectedStatus);
      setSuccess(true);
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Update User Status</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          {success ? (
            <div className="text-green-600 mb-4">
              <p>Status updated successfully!</p>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Update status for user: <span className="font-semibold">{username}</span>
              </p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600 text-sm">
                  Current status: {" "}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusOptions.find(s => s.value === currentStatus)?.color || "bg-gray-100 text-gray-800"
                  }`}>
                    {statusOptions.find(s => s.value === currentStatus)?.label || currentStatus}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            {success ? "Close" : "Cancel"}
          </button>
          
          {!success && (
            <button
              onClick={handleUpdateStatus}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting || selectedStatus === currentStatus}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Status"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;