import React from 'react';
import { X } from 'lucide-react';

interface UserDetailsModalProps {
  user: any; // Use 'any' to allow dynamic fields like suppliers, salers, etc.
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose
}) => {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get all roles - either from the roles array or from the single role string
  const userRoles = user.roles?.length 
    ? user.roles.map((r: any) => r.name) 
    : user.role ? [user.role] : [];

  // Role-specific info
  const supplierInfo = user.suppliers?.[0];
  const salerInfo = user.salers?.[0];
  const driverInfo = user.drivers?.[0];
  const stockKeeperInfo = user.stock_keepers?.[0];
  const clientInfo = user.clients?.[0];
  const cashierInfo = user.cashiers?.[0];
  const blockerInfo = user.blockers?.[0];
  const scaleMonitorInfo = user.scale_monitors?.[0];
  const productionManagerInfo = user.production_managers?.[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Account Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <p className="mt-1 text-gray-900">{user.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="mt-1 text-gray-900">{user.username || user.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'active' || user.accountStatus === 'active'
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'inactive' || user.accountStatus === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : user.status === 'suspended' || user.accountStatus === 'suspended'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status || user.accountStatus}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <p className="mt-1 text-gray-900">{formatDate(user.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Login</label>
                <p className="mt-1 text-gray-900">{user.lastLogin ? formatDate(user.lastLogin) : 'Never logged in'}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Profile Information</h3>
              
              {user.profile ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Profile ID</label>
                    <p className="mt-1 text-gray-900">{user.profile.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-gray-900">{user.profile.names}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="mt-1 text-gray-900">{user.profile.phoneNumber || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-gray-900">{user.profile.address || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Profile Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.profile.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : user.profile.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.profile.status}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-gray-900">{user.profile.updatedAt ? formatDate(user.profile.updatedAt) : 'Unknown'}</p>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No profile information available</p>
                </div>
              )}
            </div>

            {/* Roles Information */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Roles</h3>
              
              {userRoles.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {userRoles.map((role: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  
                  {user.roles?.some((r: any) => r.description) && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Role Descriptions</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {user.roles?.map((role: any) => (
                          role.description && (
                            <li key={role.id} className="pl-3 border-l-2 border-gray-200">
                              <span className="font-medium text-gray-700">{role.name}:</span> {role.description}
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No roles assigned</p>
                </div>
              )}
            </div>

            {/* Role-specific Information */}
            <div className="md:col-span-2 space-y-4">
              {supplierInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Supplier Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Supplier ID</label>
                      <p className="mt-1 text-gray-900">{supplierInfo.supplierId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">TIN Number</label>
                      <p className="mt-1 text-gray-900">{supplierInfo.tinNumber || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">District</label>
                      <p className="mt-1 text-gray-900">{supplierInfo.district || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Sector</label>
                      <p className="mt-1 text-gray-900">{supplierInfo.sector || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cell</label>
                      <p className="mt-1 text-gray-900">{supplierInfo.cell || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {salerInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Saler Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Saler ID</label>
                      <p className="mt-1 text-gray-900">{salerInfo.salerId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">TIN Number</label>
                      <p className="mt-1 text-gray-900">{salerInfo.tinNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {driverInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Driver Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Driver ID</label>
                      <p className="mt-1 text-gray-900">{driverInfo.driverId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">License Number</label>
                      <p className="mt-1 text-gray-900">{driverInfo.licenseNumber || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {stockKeeperInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Stock Keeper Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Warehouse Access Level</label>
                      <p className="mt-1 text-gray-900">{stockKeeperInfo.warehouseAccessLevel || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              )}

              {clientInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Client Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Client ID</label>
                      <p className="mt-1 text-gray-900">{clientInfo.clientId}</p>
                    </div>
                  </div>
                </div>
              )}

              {cashierInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Cashier Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cashier ID</label>
                      <p className="mt-1 text-gray-900">{cashierInfo.cashierId}</p>
                    </div>
                  </div>
                </div>
              )}

              {blockerInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Blocker Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Blocker ID</label>
                      <p className="mt-1 text-gray-900">{blockerInfo.blockerId}</p>
                    </div>
                  </div>
                </div>
              )}

              {scaleMonitorInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Scale Monitor Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Scale Monitor ID</label>
                      <p className="mt-1 text-gray-900">{scaleMonitorInfo.scaleMonitorId}</p>
                    </div>
                  </div>
                </div>
              )}

              {productionManagerInfo && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Production Manager Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Production Manager ID</label>
                      <p className="mt-1 text-gray-900">{productionManagerInfo.productManagerId}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;