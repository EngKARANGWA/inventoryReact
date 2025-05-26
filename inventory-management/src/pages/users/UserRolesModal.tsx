import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { userService, Role } from "../../services/userService";

interface UserRolesModalProps {
  userId: string | number;
  username: string;
  onClose: () => void;
  onUpdateRoles: (userId: string | number, roles: string[]) => Promise<void>;
}

const UserRolesModal: React.FC<UserRolesModalProps> = ({
  userId,
  username,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [availableRoles] = useState<string[]>([
    "ADMIN", "USER", "CASHIER", "BLOCKER", "DRIVER", 
    "CLIENT", "SALER", "STOCKKEEPER", "SCALEMONITOR", 
    "SUPPLIER", "PRODUCTIONMANAGER", "MANAGER"
  ]);
  const [selectedRole, setSelectedRole] = useState("");
  // const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user roles on load
  useEffect(() => {
    fetchUserRoles();
  }, [userId]);

  const fetchUserRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const roles = await userService.getUserRoles(userId);
      if (roles && roles.roles) {
        setUserRoles(roles.roles);
      }
    } catch (err) {
      console.error("Error fetching user roles:", err);
      setError("Failed to load user roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!selectedRole) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      await userService.assignRolesToUser(userId, [selectedRole]);
      
      // Refetch roles to ensure we have the latest data
      await fetchUserRoles();
      
      setSelectedRole("");
    } catch (err) {
      console.error("Error adding role:", err);
      setError("Failed to add role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveRole = async (roleId: number | string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      await userService.removeRolesFromUser(userId, [roleId]);
      
      // Refetch roles to ensure we have the latest data
      await fetchUserRoles();
    } catch (err) {
      console.error("Error removing role:", err);
      setError("Failed to remove role. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage User Roles</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-4">
            Manage roles for: <span className="font-semibold">{username}</span>
          </p>
          
          {/* Add new role */}
          <div className="flex space-x-2 mb-4">
            <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            <option value="">Select a role to add</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddRole}
            disabled={!selectedRole || isSubmitting}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Current roles */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="text-sm font-medium text-gray-700">Current Roles</h3>
          </div>
          {isLoading ? (
            <div className="p-4 text-center">
              <svg className="animate-spin h-5 w-5 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : userRoles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No roles assigned</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {userRoles.map((role) => (
                <li key={role.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-800">{role.name}</span>
                    {role.description && (
                      <p className="text-xs text-gray-500">{role.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveRole(role.id)}
                    disabled={isSubmitting || userRoles.length <= 1}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={userRoles.length <= 1 ? "Users must have at least one role" : "Remove role"}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {userRoles.length <= 1 && (
          <p className="text-xs text-gray-500 mt-2">
            Note: Users must have at least one role
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);
};

export default UserRolesModal;