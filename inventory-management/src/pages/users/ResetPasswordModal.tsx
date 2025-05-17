import React, { useState } from "react";
import { X } from "lucide-react";

interface ResetPasswordModalProps {
  userId: string | number;
  username: string;
  onClose: () => void;
  onResetPassword: (userId: string | number) => Promise<void>;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  userId,
  username,
  onClose,
  onResetPassword,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    try {
      setIsSubmitting(true);
      await onResetPassword(userId);
      setSuccess(true);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Reset Password</h2>
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
              <p className="mb-2">Password reset successful!</p>
              <p>
                A new temporary password has been sent to the user's email
                address.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4">
                Are you sure you want to reset the password for <span className="font-semibold">{username}</span>?
              </p>
              <p className="text-gray-600 text-sm mb-4">
                This will generate a new temporary password and send it to the
                user's email address. They will be required to change it on their
                next login.
              </p>
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
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;