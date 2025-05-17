import React from "react";
import { Edit2, Trash2, Eye, Phone, Key, UserCheck, Users } from "lucide-react";
import PaginationControls from "./PaginationControls";
import { User } from "../../services/userService";
import { toast } from "react-toastify";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  onRequestSort: (key: keyof User) => void;
  sortConfig: {
    key: keyof User;
    direction: "ascending" | "descending";
  } | null;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (user: User) => void;
  onUpdateStatus: (user: User) => void;
  onManageRoles: (user: User) => void;
  onViewDetails: (user: User) => void;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  error,
  searchTerm,
  onRequestSort,
  sortConfig,
  // onEditUser,
  onDeleteUser,
  onResetPassword,
  onUpdateStatus,
  onManageRoles,
  onViewDetails,
  totalUsers,
  currentPage,
  pageSize,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Define the sortable columns explicitly
  const sortableColumns: (keyof User)[] = [
    "username",
    "email",
    "role",
    "status",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {sortableColumns.includes("username") && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onRequestSort("username")}
                >
                  <div className="flex items-center">
                    Name
                    {sortConfig?.key === "username" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              )}

              {sortableColumns.includes("email") && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onRequestSort("email")}
                >
                  <div className="flex items-center">
                    Email
                    {sortConfig?.key === "email" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              )}

              {sortableColumns.includes("role") && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onRequestSort("role")}
                >
                  <div className="flex items-center">
                    Role
                    {sortConfig?.key === "role" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              )}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>

              {sortableColumns.includes("status") && (
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => onRequestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortConfig?.key === "status" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              )}

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found. {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.roles?.[0]?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-400" />
                      {user.profile?.phoneNumber || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "active" ||
                        user.accountStatus === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "inactive" ||
                            user.accountStatus === "inactive"
                          ? "bg-red-100 text-red-800"
                          : user.status === "suspended" ||
                            user.accountStatus === "suspended"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status || user.accountStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.roles?.[0]?.name !== "ADMIN" ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => onViewDetails(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            // onEditUser(user);
                            toast.info("Edit feature to be implemented soon", {
                              position: "top-right",
                              autoClose: 3000,
                            });
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit User"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onResetPassword(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Reset Password"
                        >
                          <Key className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Change Status"
                        >
                          <UserCheck className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onManageRoles(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Manage Roles"
                        >
                          <Users className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            user.id && onDeleteUser(String(user.id))
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2"></div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalUsers > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={totalUsers}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default UsersTable;
