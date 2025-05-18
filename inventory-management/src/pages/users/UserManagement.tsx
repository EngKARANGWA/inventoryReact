import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userService, User } from "../../services/userService";
import UserStatsCards from "./UserStatsCards";
import UserActionsBar from "./UserActionsBar";
import UsersTable from "./UsersTable";
import RoleFormModal from "./RoleFormModal";
import UserDetailsModal from "./UserDetailsModal";
import ResetPasswordModal from "./ResetPasswordModal";
import UserStatusModal from "./UserStatusModal";
import UserRolesModal from "./UserRolesModal";

const UserManagement: React.FC = () => {
  // State to store all users fetched from backend
  const [allUsers, setAllUsers] = useState<User[]>([]);
  // State to store filtered users for display
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    page: 1,
    pageSize: 10,
  });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  } | null>(null);

  // Helper function to map role names to form identifiers
  const mapRoleNameToIdentifier = (roleName: string): string => {
    if (!roleName) return "";

    // Normalize the role name to uppercase and remove underscores
    const normalizedRole = roleName.toUpperCase().replace(/_/g, "");

    const roleMap: Record<string, string> = {
      ADMIN: "admin",
      BLOCKER: "blocker",
      CASHIER: "cashier",
      CLIENT: "client",
      DRIVER: "driver",
      SALER: "saler",
      STOCKKEEPER: "stockKeeper",
      SCALEMONITOR: "scaleMonitor",
      PRODUCTIONMANAGER: "productionManager",
      PRODUCTMANAGER: "productionManager",
      MANAGER: "manager",
    };

    return roleMap[normalizedRole] || roleName.toLowerCase();
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever filters or search term changes
  useEffect(() => {
    applyFilters();
  }, [allUsers, filters, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getAllUsers();
      const usersData = Array.isArray(response)
        ? response
        : (response as { data: User[] })?.data || [];

      if (!Array.isArray(usersData)) {
        console.warn("Unexpected response format:", response);
        setAllUsers([]);
        setTotalUsers(0);
      } else {
        setAllUsers(usersData);
        // Initially set filtered users to all users
        setFilteredUsers(usersData);
        setTotalUsers(usersData.length);
      }
    } catch (err: unknown) {
      console.error("Error fetching users:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch users. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to the fetched users
  const applyFilters = () => {
    let result = [...allUsers];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (filters.role) {
      result = result.filter((user) => {
        // Check if role matches either in user.role or user.roles array
        if (
          user.role &&
          user.role.toLowerCase() === filters.role.toLowerCase()
        ) {
          return true;
        }
        if (user.roles && user.roles.length > 0) {
          return user.roles.some(
            (role) => role.name.toLowerCase() === filters.role.toLowerCase()
          );
        }
        return false;
      });
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((user) => {
        const userStatus = user.status || user.accountStatus;
        return userStatus?.toLowerCase() === filters.status.toLowerCase();
      });
    }

    // Apply pagination
    setTotalUsers(result.length);

    // Set filtered users
    setFilteredUsers(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page on filter change
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      status: "",
      page: 1,
      pageSize: 10,
    });
    setSearchTerm("");
  };

  const handleAddUser = (role: string) => {
    setEditingUser(null);
    setSelectedRole(role || "");
    setShowRoleForm(true);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        // Determine the user's role
        const effectiveRole =
          selectedRole ||
          mapRoleNameToIdentifier(
            editingUser.roles?.[0]?.name || editingUser.role || ""
          );

        // Determine which role-specific ID to use (if available)
        let roleSpecificId;
        if (effectiveRole === "driver" && editingUser.driverId) {
          roleSpecificId = editingUser.driverId;
        } else if (effectiveRole === "cashier" && editingUser.cashierId) {
          roleSpecificId = editingUser.cashierId;
        } else if (effectiveRole === "client" && editingUser.clientId) {
          roleSpecificId = editingUser.clientId;
        } else if (effectiveRole === "blocker" && editingUser.blockerId) {
          roleSpecificId = editingUser.blockerId;
        } else if (effectiveRole === "supplier" && editingUser.supplierId) {
          roleSpecificId = editingUser.supplierId;
        } else if (effectiveRole === "saler" && editingUser.salerId) {
          roleSpecificId = editingUser.salerId;
        } else if (
          effectiveRole === "stockkeeper" &&
          editingUser.stockKeeperId
        ) {
          roleSpecificId = editingUser.stockKeeperId;
        } else if (
          effectiveRole === "scalemonitor" &&
          editingUser.scaleMonitorId
        ) {
          roleSpecificId = editingUser.scaleMonitorId;
        } else if (
          effectiveRole === "productionmanager" &&
          editingUser.productManagerId
        ) {
          roleSpecificId = editingUser.productManagerId;
        }

        console.log(
          `Using role: ${effectiveRole}, ID to update: ${
            roleSpecificId || editingUser.id
          }`
        );

        // Create the user data object with all fields
        const userData = {
          // User model data
          username: formData.username,
          email: formData.email,
          status: formData.status || "active",

          // Profile data
          names: formData.names,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          profileId: editingUser.profile?.id,

          // Include role-specific IDs to help identify which tables to update
          id: editingUser.id,
          driverId: editingUser.driverId,
          cashierId: editingUser.cashierId,
          clientId: editingUser.clientId,
          blockerId: editingUser.blockerId,
          supplierId: editingUser.supplierId,
          salerId: editingUser.salerId,
          stockKeeperId: editingUser.stockKeeperId,
          scaleMonitorId: editingUser.scaleMonitorId,
          productManagerId: editingUser.productManagerId,

          // Role-specific fields
          tinNumber: formData.tinNumber,
          licenseNumber: formData.licenseNumber,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,

          // Include the role to inform the backend which service to use
          role: effectiveRole,
        };

        // Update the user - use the role-specific ID if available, otherwise use the user ID
        const idToUse = roleSpecificId || editingUser.id;
        await userService.updateUser(idToUse, userData, effectiveRole);
        toast.success("User updated successfully");
      } else {
        // For creating new users (existing code)
        const userDataWithRole = {
          ...formData,
          role: selectedRole || formData.role,
        };
        await userService.createUser(userDataWithRole);
        toast.success("User created successfully");
      }

      setShowRoleForm(false);
      setEditingUser(null);
      setSelectedRole("");
      fetchUsers();
    } catch (err: unknown) {
      console.error("Error saving user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save user";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId);
        fetchUsers(); // Refresh after delete
        toast.success("User deleted successfully");
      } catch (err) {
        setError("Failed to delete user");
        toast.error("Failed to delete user");
      }
    }
  };

  const handleResetPassword = async (userId: string | number) => {
    try {
      await userService.resetUserPassword(userId);
      toast.success("Password reset successfully");
      // Close the modal after successfully resetting password
      setShowResetPasswordModal(false);
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.error("Failed to reset password");
    }
  };

  const handleUpdateStatus = async (
    userId: string | number,
    status: string
  ) => {
    try {
      await userService.updateUserStatus(userId, status as any);
      toast.success("User status updated successfully");
      // Close the modal after successfully updating status
      setShowStatusModal(false);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      toast.error("Failed to update user status");
    }
  };

  const handleUpdateRoles = async (
    userId: string | number,
    roles: string[]
  ) => {
    try {
      await userService.assignRolesToUser(userId, roles);
      toast.success("User roles updated successfully");
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Error updating user roles:", err);
      toast.error("Failed to update user roles");
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleUserAction = (action: string, user: User) => {
    setEditingUser(user);

    switch (action) {
      case "edit":
        // Get the role name from either the roles array or role field
        const roleName = user.roles?.[0]?.name || user.role || "";
        // Map it to the correct identifier for the form
        const roleIdentifier = mapRoleNameToIdentifier(roleName);

        console.log(
          `Editing user with role: ${roleName}, mapped to: ${roleIdentifier}`
        );
        console.log("User data:", user);

        // First, extract any role-specific IDs from the user object
        // We need to identify which role-specific ID is available
        let roleSpecificId;
        let roleSpecificIdField;

        if (user.driverId) {
          roleSpecificId = user.driverId;
          roleSpecificIdField = "driverId";
        } else if (user.cashierId) {
          roleSpecificId = user.cashierId;
          roleSpecificIdField = "cashierId";
        } else if (user.clientId) {
          roleSpecificId = user.clientId;
          roleSpecificIdField = "clientId";
        } else if (user.blockerId) {
          roleSpecificId = user.blockerId;
          roleSpecificIdField = "blockerId";
        } else if (user.supplierId) {
          roleSpecificId = user.supplierId;
          roleSpecificIdField = "supplierId";
        } else if (user.salerId) {
          roleSpecificId = user.salerId;
          roleSpecificIdField = "salerId";
        } else if (user.stockKeeperId) {
          roleSpecificId = user.stockKeeperId;
          roleSpecificIdField = "stockKeeperId";
        } else if (user.scaleMonitorId) {
          roleSpecificId = user.scaleMonitorId;
          roleSpecificIdField = "scaleMonitorId";
        } else if (user.productManagerId) {
          roleSpecificId = user.productManagerId;
          roleSpecificIdField = "productManagerId";
        }

        console.log(
          `Found role-specific ID: ${roleSpecificIdField} = ${roleSpecificId}`
        );

        // Create initial data object with all potential fields
        const initialData: any = {
          // Common user fields
          id: user.id,
          username: user.username || "",
          email: user.email || "",

          // Profile fields
          names: user.profile?.names || user.username || "",
          phoneNumber: user.profile?.phoneNumber || "",
          address: user.profile?.address || "",
          status: user.accountStatus || user.status || "active",

          // Role information
          role: roleIdentifier,

          // Role-specific fields
          tinNumber: user.tinNumber || "",
          licenseNumber: user.licenseNumber || "",
          district: user.district || "",
          sector: user.sector || "",
          cell: user.cell || "",

          // Role-specific IDs - include all that might be available
          driverId: user.driverId,
          cashierId: user.cashierId,
          clientId: user.clientId,
          blockerId: user.blockerId,
          supplierId: user.supplierId,
          salerId: user.salerId,
          stockKeeperId: user.stockKeeperId,
          scaleMonitorId: user.scaleMonitorId,
          productManagerId: user.productManagerId,
        };

        // Log the complete initial data for debugging
        console.log("Initial form data:", initialData);

        setSelectedRole(roleIdentifier);
        setShowRoleForm(true);
        break;

      case "reset-password":
        setShowResetPasswordModal(true);
        break;

      case "update-status":
        setShowStatusModal(true);
        break;

      case "manage-roles":
        setShowRolesModal(true);
        break;

      case "view-details":
        setShowDetailsModal(true);
        break;

      default:
        console.warn(`Unknown action: ${action}`);
        break;
    }
  };

  const requestSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Sort users
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  // Apply pagination
  const paginatedUsers = React.useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + Number(filters.pageSize);
    return sortedUsers.slice(startIndex, endIndex);
  }, [sortedUsers, filters.page, filters.pageSize]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                User Management
              </h1>
              <p className="text-gray-600">
                Manage system users and their permissions
              </p>
            </div>

            <UserStatsCards users={allUsers} />

            <UserActionsBar
              searchTerm={searchTerm}
              onSearch={handleSearch}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onRefresh={handleRefresh}
              onAddUser={handleAddUser}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onApplyFilters={applyFilters} // Now just applies the filters locally
            />

            <UsersTable
              users={paginatedUsers}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              onRequestSort={requestSort}
              sortConfig={sortConfig}
              onEditUser={(user) => handleUserAction("edit", user)}
              onDeleteUser={handleDeleteUser}
              onResetPassword={(user) =>
                handleUserAction("reset-password", user)
              }
              onUpdateStatus={(user) => handleUserAction("update-status", user)}
              onManageRoles={(user) => handleUserAction("manage-roles", user)}
              onViewDetails={(user) => handleUserAction("view-details", user)}
              totalUsers={totalUsers}
              currentPage={filters.page}
              pageSize={filters.pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </main>
      </div>

      {showRoleForm && (
        <RoleFormModal
          role={selectedRole}
          onClose={() => {
            setShowRoleForm(false);
            setEditingUser(null);
            setSelectedRole("");
          }}
          onSubmit={handleFormSubmit}
          initialData={
            editingUser
              ? {
                  id: editingUser.id,
                  names:
                    editingUser.profile?.names || editingUser.username || "",
                  username: editingUser.username || "",
                  email: editingUser.email || "",
                  phoneNumber: editingUser.profile?.phoneNumber || "",
                  address: editingUser.profile?.address || "",
                  status:
                    editingUser.accountStatus ||
                    editingUser.accountStatus ||
                    "active",
                  tinNumber: editingUser.tinNumber || "",
                  licenseNumber: editingUser.licenseNumber || "",
                  district: editingUser.district || "",
                  sector: editingUser.sector || "",
                  cell: editingUser.cell || "",
                  blockerId: editingUser.blockerId,
                  scaleMonitorId: editingUser.scaleMonitorId,
                  salerId: editingUser.salerId,
                  driverId: editingUser.driverId,
                  supplierId: editingUser.supplierId,
                  productManagerId: editingUser.productManagerId,
                  cashierId: editingUser.cashierId,
                  stockKeeperId: editingUser.stockKeeperId,
                  clientId: editingUser.clientId,
                  role: selectedRole,
                }
              : undefined
          }
          isSubmitting={isSubmitting}
          mode={editingUser ? "edit" : "add"}
        />
      )}

      {showDetailsModal && editingUser && (
        <UserDetailsModal
          user={{
            id: String(editingUser.id),
            name: editingUser.username || "",
            email: editingUser.email || "",
            role: editingUser.roles?.[0]?.name || editingUser.role || "",
            status:
              editingUser.accountStatus || editingUser.accountStatus || "",
            createdAt: editingUser.createdAt,
            lastLogin: editingUser.lastLogin,
            profile: editingUser.profile
              ? {
                  id: editingUser.profile.id,
                  names: editingUser.profile.names,
                  phoneNumber: editingUser.profile.phoneNumber,
                  address: editingUser.profile.address,
                  status: editingUser.profile.status,
                  createdAt: editingUser.profile.createdAt,
                  updatedAt: editingUser.profile.updatedAt,
                }
              : undefined,
            roles: editingUser.roles?.map((role) => ({
              id: role.id,
              name: role.name,
              description: role.description,
              createdAt: role.createdAt,
            })),
          }}
          onClose={() => {
            setShowDetailsModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {showResetPasswordModal && editingUser && (
        <ResetPasswordModal
          userId={editingUser.id}
          username={editingUser.username}
          onClose={() => {
            setShowResetPasswordModal(false);
            setEditingUser(null);
          }}
          onResetPassword={handleResetPassword}
        />
      )}

      {showStatusModal && editingUser && (
        <UserStatusModal
          userId={editingUser.id}
          username={editingUser.username}
          currentStatus={
            editingUser.accountStatus || editingUser.accountStatus || "active"
          }
          onClose={() => {
            setShowStatusModal(false);
            setEditingUser(null);
          }}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {showRolesModal && editingUser && (
        <UserRolesModal
          userId={editingUser.id}
          username={editingUser.username}
          onClose={() => {
            setShowRolesModal(false);
            setEditingUser(null);
          }}
          onUpdateRoles={handleUpdateRoles}
        />
      )}
    </div>
  );
};

export default UserManagement;
