import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';
import { Search, Edit2, Trash2, Filter, ChevronDown, ChevronUp, Eye, Users, UserCheck, UserX, Phone, Clock, Plus, RefreshCw } from 'lucide-react';
import { userService, User } from '../../services/userService';
import RoleForm from '../../components/users/RoleForm';
import UserDetailsModal from '../../components/users/UserDetailsModal';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const UserManagement: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const skipRole = queryParams.get('skipRole') === 'true';
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    page: 1,
    pageSize: 10
  });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'ascending' | 'descending';
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
      const usersData = Array.isArray(response) ? response : (response as { data: User[] })?.data || [];
      
      if (!Array.isArray(usersData)) {
        console.warn('Unexpected response format:', response);
        setUsers([]);
        setTotalUsers(0);
      } else {
        setUsers(usersData);
        setTotalUsers(usersData.length); // Update this if your API provides pagination info
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
  };



  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    handlePageChange(1); // Reset to first page when searching
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
    handlePageChange(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      page: 1,
      pageSize: 10
    });
    setSearchTerm('');
  };

  const handleAddUser = (role: string) => {
    if (skipRole) {
      const defaultUserData = {
        username: '',
        email: '',
        role: role || 'user',
        status: 'active'
      };
      handleFormSubmit(defaultUserData);
    } else {
      setSelectedRole(role);
      setShowRoleForm(true);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role || '');
    setShowRoleForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user.id !== userId));
        setTotalUsers(totalUsers - 1);
        toast.success('User deleted successfully');
      } catch (err) {
        setError('Failed to delete user');
        toast.error('Failed to delete user');
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingUser && editingUser.id) {
        await userService.updateUser(editingUser.id, formData);
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...formData } : user
        ));
        toast.success('User updated successfully');
      } else {
        const userDataWithRole = {
          ...formData,
          role: selectedRole || formData.role
        };
        const newUser = await userService.createUser(userDataWithRole);
        setUsers([newUser, ...users]);
        setTotalUsers(totalUsers + 1);
        toast.success('User created successfully');
      }
      setShowRoleForm(false);
      setEditingUser(null);
      setSelectedRole('');
    } catch (err) {
      setError('Failed to save user');
      toast.error('Failed to save user');
      console.error('Error saving user:', err);
      toast.error('Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const sortedUsers = React.useMemo(() => {
    if (!sortConfig) return filteredUsers;

    return [...filteredUsers].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredUsers, sortConfig]);



  const availableRoles = [
    { id: 'blocker', label: 'Blocker' },
    { id: 'scaleMonitor', label: 'Scale Monitor' },
    { id: 'saler', label: 'Saler' },
    { id: 'stockKeeper', label: 'Stock Keeper' },
    { id: 'client', label: 'Client' },
    { id: 'driver', label: 'Driver' },
    { id: 'supplier', label: 'Supplier' },
    { id: 'productionManager', label: 'Production Manager' },
    { id: 'cashier', label: 'Cashier' }
  ];

  // Calculate summary data
  const activeUsers = users.filter(user => user.status === 'active').length;
  const inactiveUsers = users.filter(user => user.status === 'inactive').length;
  const recentLogins = users.filter(user => user.role !== 'Driver').length;

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
              <p className="text-gray-600">Manage system users and their permissions</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Users</p>
                    <p className="text-2xl font-bold text-gray-800">{activeUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Inactive Users</p>
                    <p className="text-2xl font-bold text-gray-800">{inactiveUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <UserX className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recent Logins</p>
                    <p className="text-2xl font-bold text-gray-800">{recentLogins}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                    {showFilters ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh data"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={() => handleAddUser('')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" />
                    Add User
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Roles</option>
                        {availableRoles.map(role => (
                          <option key={role.id} value={role.id}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
                      <select
                        name="pageSize"
                        value={filters.pageSize}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={fetchUsers}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('username')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortConfig?.key === 'username' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {sortConfig?.key === 'email' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('role')}
                      >
                        <div className="flex items-center">
                          Role
                          {sortConfig?.key === 'role' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig?.key === 'status' && (
                            <span className="ml-1">
                              {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
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
                    ) : sortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No users found. {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      sortedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.username?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {user.roles?.[0]?.name || user.role || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1 text-gray-400" />
                              {user.profile?.phoneNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status || user.accountStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setEditingUser(user);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit User"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => user.id && handleDeleteUser(String(user.id))}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* {renderPagination()} */}
              </div>

              {totalUsers > 0 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage >= totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * pageSize + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, totalUsers)}
                        </span>{" "}
                        of <span className="font-medium">{totalUsers}</span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronUp className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage >= totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronDown className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Role Form Modal */}
      {showRoleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingUser ? 'Edit User Role' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowRoleForm(false);
                  setEditingUser(null);
                  setSelectedRole('');
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RoleForm
              role={selectedRole}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowRoleForm(false);
                setEditingUser(null);
                setSelectedRole('');
              }}
              initialData={editingUser || undefined}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && editingUser && (
        <UserDetailsModal
          user={{
            id: String(editingUser.id),
            name: editingUser.username || '',
            role: editingUser.roles?.[0]?.name || editingUser.role || '',
            status: editingUser.status || editingUser.accountStatus || '',
            roleSpecificData: {
              phoneNumber: editingUser.profile?.phoneNumber,
              address: editingUser.profile?.address,
              ...editingUser.roleSpecificData
            }
          }}
          onClose={() => {
            setShowDetailsModal(false);
            setEditingUser(null);
          }}
          onUpdateRoles={(userId, newRoles) => {
            // Handle role update
            const updatedUsers = users.map(user => 
              user.id === userId 
                ? { ...user, role: newRoles[0] } 
                : user
            );
            setUsers(updatedUsers);
          }}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default UserManagement;