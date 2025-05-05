import React from "react";
import { X } from "lucide-react";
import RoleForm from "../../components/users/RoleForm";

interface RoleFormModalProps {
  role: string;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  initialData?: any;
  isSubmitting: boolean;
  mode: "add" | "edit";
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  role,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  mode,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "edit" ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>
        <RoleForm
          role={role}
          onSubmit={onSubmit}
          onClose={onClose}
          initialData={initialData}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default RoleFormModal;