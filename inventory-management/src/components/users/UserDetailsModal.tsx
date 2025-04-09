import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface UserDetailsModalProps {
  user: {
    id: string;
    name: string;
    role: string;
    status: string;
    roleSpecificData: any;
  };
  onClose: () => void;
  onUpdateRoles: (userId: string, newRoles: string[]) => void;
}

const availableRoles = [
  'Driver',
  'Cashier',
  'Inventory Manager',
  'Manager',
  'Administrator'
];

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onUpdateRoles
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([user.role]);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleSaveRoles = () => {
    onUpdateRoles(user.id, selectedRoles);
    setShowRoleSelector(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-500">ID</label>
              <p className="mt-1 text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </p>
            </div>
          </div>

          {/* Role Information */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Roles</h3>
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                {showRoleSelector ? 'Cancel' : 'Add Role'}
              </button>
            </div>

            {showRoleSelector ? (
              <div className="space-y-3">
                {availableRoles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{role}</span>
                    <button
                      onClick={() => handleRoleToggle(role)}
                      className={`p-1 rounded-full ${
                        selectedRoles.includes(role)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleSaveRoles}
                  className="w-full mt-4 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Roles
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedRoles.map((role) => (
                  <div
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mr-2 mb-2"
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role-Specific Information */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Role-Specific Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(user.roleSpecificData).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-500">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <p className="mt-1 text-gray-900">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal; 