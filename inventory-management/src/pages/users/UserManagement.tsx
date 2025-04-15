import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';
import { Search, Edit2, Trash2, Filter, ChevronDown, ChevronUp, Eye, Users, UserCheck, UserX, Phone, MapPin, Clock, RefreshCw } from 'lucide-react';
import { userService, User } from '../../services/userService';
import RoleForm from '../../components/users/RoleForm';
import UserDetailsModal from '../../components/users/UserDetailsModal';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    status: ''
  });
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [expandedUser] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAllUsers();
      // Check if response is an array or has a data property
      const usersData = Array.isArray(response) ? response : (response as { data: User[] })?.data || [];
      if (!Array.isArray(usersData)) {
        console.warn('Unexpected response format:', response);
        setUsers([]);
      } else {
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchUsers();
      toast.success('Users data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh users data');
      console.error('Error refreshing users:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: ''
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleAddUser = (role: string) => {
    if (skipRole) {
      // If skipRole is true, directly create a user without showing the role form
      const defaultUserData = {
        username: '',
        email: '',
        role: role || 'user', // Default to 'user' if no role is provided
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
        toast.success('User deleted successfully');
        // Reset to first page if the last user on the current page was deleted
        if (currentUsers.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError('Failed to delete user');
        toast.error('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingUser && editingUser.id) {
        await userService.updateUser(editingUser.id, formData);
        setUsers(users.map(user => 
          user.id === editingUser.id ? { ...user, ...formData } : user
        ));
        toast.success('User updated successfully');
      } else {
        // Add the role to the formData when creating a new user
        const userDataWithRole = {
          ...formData,
          role: selectedRole || formData.role // Use selectedRole if available, otherwise use formData.role
        };
        console.log('Creating user with role:', userDataWithRole.role);
        const newUser = await userService.createUser(userDataWithRole);
        setUsers([...users, newUser]);
        toast.success('User created successfully');
        // Go to the last page to show the newly added user
        const newTotalPages = Math.ceil((filteredUsers.length + 1) / usersPerPage);
        setCurrentPage(newTotalPages);
      }
      setShowRoleForm(false);
      setEditingUser(null);
      setSelectedRole('');
    } catch (err) {
      setError('Failed to save user');
      toast.error('Failed to save user');
      console.error('Error saving user:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleUpdateRoles = (userId: string, newRoles: string[]) => {
    // In a real application, this would make an API call to update the user's roles
    console.log('Updating roles for user:', userId, 'New roles:', newRoles);
    // Update the local state
    setUsers((prevUsers: User[]) =>
      prevUsers.map((user: User) =>
        user.id === userId
          ? { ...user, role: newRoles[0] as User['role'] } // For now, just use the first role
          : user
      ) as User[]
    );
  };

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
  const totalUsers = users.length;
  const recentLogins = users.filter(user => user.role !== 'Driver').length;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(indexOfLastUser, filteredUsers.length)}
          </span>{' '}
          of <span className="font-medium">{filteredUsers.length}</span> results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => setCurrentPage(number)}
              className={`px-4 py-2 border rounded-md ${currentPage === number ? 'bg-blue-50 text-blue-600 border-blue-500' : 'hover:bg-gray-50'}`}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
      </div>
    );
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
        <main className="flex-1 w-full">
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
                  <select
                    value={selectedRole}
                    onChange={(e) => handleAddUser(e.target.value)}
                    className="px-4 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Add User</option>
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Filter Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
                    >
                      Clear Filters
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-red-600">{error}</td>
                      </tr>
                    ) : currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">No users found</td>
                      </tr>
                    ) : (
                      currentUsers.map((user) => (
                        <React.Fragment key={user.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.roles?.[0]?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.profile?.phoneNumber || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowDetailsModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 mr-4"
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
                          {expandedUser === user.id && (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                <div className="text-sm">
                                  <h4 className="font-medium text-gray-900 mb-2">User Details</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                      <MapPin size={18} className="mr-2 mt-1 text-gray-400" />
                                      <div>
                                        <p className="font-medium text-gray-700">Address</p>
                                        <p className="text-gray-600">{user.address || 'N/A'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start">
                                      <Phone size={18} className="mr-2 mt-1 text-gray-400" />
                                      <div>
                                        <p className="font-medium text-gray-700">Phone</p>
                                        <p className="text-gray-600">{user.phoneNumber || 'N/A'}</p>
                                      </div>
                                    </div>
                                    {user.role === 'driver' && (
                                      <div className="flex items-start">
                                        <div className="mr-2 mt-1 text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="6" width="20" height="12" rx="2" />
                                            <path d="M12 18v-6" />
                                            <path d="M8 18v-6" />
                                            <path d="M16 18v-6" />
                                          </svg>
                                        </div>
                                        <div>
                                          <p className="font-medium text-gray-700">License Number</p>
                                          <p className="text-gray-600">{user.licenseNumber || 'N/A'}</p>
                                        </div>
                                      </div>
                                    )}
                                    {user.role === 'supplier' && (
                                      <>
                                        <div className="flex items-start">
                                          <div className="mr-2 mt-1 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-700">District</p>
                                            <p className="text-gray-600">{user.district || 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-start">
                                          <div className="mr-2 mt-1 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-700">Sector</p>
                                            <p className="text-gray-600">{user.sector || 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-start">
                                          <div className="mr-2 mt-1 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                                              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
                                            </svg>
                                          </div>
                                          <div>
                                            <p className="font-medium text-gray-700">Cell</p>
                                            <p className="text-gray-600">{user.cell || 'N/A'}</p>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
                {renderPagination()}
              </div>
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
            role: editingUser.role || '',
            status: editingUser.status || '',
            roleSpecificData: editingUser.roleSpecificData || {}
          }}
          onClose={() => {
            setShowDetailsModal(false);
            setEditingUser(null);
          }}
          onUpdateRoles={handleUpdateRoles}
        />
      )}
    </div>
  );
};

export default UserManagement;