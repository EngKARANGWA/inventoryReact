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
import UserDetailsModal from "../../components/users/UserDetailsModal";

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: "ascending" | "descending";
  } | null>(null);

  // Fetch users when filters or search term changes
  useEffect(() => {
    fetchUsers();
  }, [filters, searchTerm]);

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
        setUsers([]);
        setTotalUsers(0);
      } else {
        setUsers(usersData);
        setTotalUsers(usersData.length);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handlePageChange(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
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

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role || "");
    setShowRoleForm(true);
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

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        await userService.updateUser(editingUser.id, formData);
        toast.success("User updated successfully");
      } else {
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
      fetchUsers(); // Refresh after create/update
    } catch (err) {
      setError("Failed to save user");
      toast.error("Failed to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const requestSort = (key: keyof User) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

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

            <UserStatsCards users={users} />

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
              onApplyFilters={fetchUsers}
            />

            <UsersTable
              users={sortedUsers}
              loading={loading}
              error={error}
              searchTerm={searchTerm}
              onRequestSort={requestSort}
              sortConfig={sortConfig}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onViewDetails={(user) => {
                setEditingUser(user);
                setShowDetailsModal(true);
              }}
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
          initialData={editingUser || undefined}
          isSubmitting={isSubmitting}
          mode={editingUser ? "edit" : "add"}
        />
      )}

      {showDetailsModal && editingUser && (
        <UserDetailsModal
          user={{
            id: String(editingUser.id),
            name: editingUser.username || "",
            role: editingUser.roles?.[0]?.name || editingUser.role || "",
            status: editingUser.status || editingUser.accountStatus || "",
            roleSpecificData: {
              phoneNumber: editingUser.profile?.phoneNumber,
              address: editingUser.profile?.address,
              ...editingUser.roleSpecificData,
            },
          }}
          onClose={() => {
            setShowDetailsModal(false);
            setEditingUser(null);
          }}
          onUpdateRoles={(userId, newRoles) => {
            const updatedUsers = users.map((user) =>
              user.id === userId ? { ...user, role: newRoles[0] } : user
            );
            setUsers(updatedUsers);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;