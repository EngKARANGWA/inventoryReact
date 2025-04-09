import axios from 'axios';

const API_BASE_URL = 'https://test.gvibyequ.a2hosted.com/api';

export interface User {
  id: string | number;
  username: string;
  name?: string; // For frontend display
  email: string;
  password?: string; // For user creation/update
  role?: string;
  status?: 'active' | 'inactive'; // For frontend display
  accountStatus: 'active' | 'inactive';
  phoneNumber?: string;
  address?: string;
  createdAt?: string;
  lastLogin?: string;
  roleSpecificData?: any;
  district?: string;
  sector?: string;
  cell?: string;
  licenseNumber?: string;
}

// Cashier interface
export interface Cashier {
  id: number;
  cashierId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    accountStatus: string;
    isDefaultPassword: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    profile: {
      id: number;
      names: string;
      phoneNumber: string;
      address: string;
      status: string;
      userId: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
      user_id: number;
    };
  };
}

interface PaginatedResponse<T> {
  count: number;
  rows: T[];
}

// Helper function to extract data from API response
const extractData = (response: any): any => {
  // For GET /users endpoint, ensure we always return an array
  if (response?.config?.url?.includes('/users') && !response?.config?.url?.includes('/users/')) {
    return response.data?.rows || response.data || [];
  }
  
  // For other endpoints
  if (response?.data?.rows) {
    return response.data.rows;
  }
  if (response?.data) {
    return response.data;
  }
  if (response?.rows) {
    return response.rows;
  }
  return response;
};

// Helper function to map user data
const mapUserData = (user: any) => {
  return {
    ...user,
    name: user.username, // Map username to name for frontend display
    status: user.accountStatus, // Map accountStatus to status for frontend display
    role: user.role || 'admin' // Default role if not provided
  };
};

export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axios.get<PaginatedResponse<User>>(`${API_BASE_URL}/users`);
      const users = extractData(response);
      
      // Ensure we always have an array before mapping
      if (!Array.isArray(users)) {
        console.warn('Expected array but got:', users);
        return [];
      }
      
      return users.map(mapUserData);
    } catch (error) {
      console.error('Error fetching users:', error);
      return []; // Return empty array on error
    }
  },

  // Get a single user by ID
  getUserById: async (userId: string | number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
      const user = extractData(response);
      return mapUserData(user);
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  },

  // Create a new user - with role-specific endpoint handling
  createUser: async (userData: any) => {
    try {
      // Determine the correct endpoint based on role
      const role = userData.role?.toLowerCase();
      let endpoint = '/users'; // default endpoint

      if (role === 'cashier') {
        endpoint = '/cashier';
      } else if (role === 'blocker') {
        endpoint = '/blocker';
      } else if (role === 'driver') {
        endpoint = '/driver';
      } else if (role === 'admin') {
        endpoint = '/admin';
      }

      console.log('Creating user with role:', role);
      console.log('Using endpoint:', endpoint);
      console.log('User data:', userData);

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, userData);
      return extractData(response);
    } catch (error) {
      console.error('Error creating user:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw error;
    }
  },

  // Update an existing user - with role-specific endpoint handling
  updateUser: async (userId: string | number, userData: Partial<User>) => {
    try {
      const dataToSend = {
        ...userData,
        username: userData.name || userData.username,
        accountStatus: userData.status || userData.accountStatus
      };
      
      // Determine which endpoint to use based on the role
      let endpoint = `${API_BASE_URL}/users/${userId}`;
      
      if (userData.role) {
        switch (userData.role.toLowerCase()) {
          case 'cashier':
            endpoint = `${API_BASE_URL}/cashier/${userId}`;
            break;
          case 'blocker':
            endpoint = `${API_BASE_URL}/blockers/${userId}`;
            break;
          case 'driver':
            endpoint = `${API_BASE_URL}/drivers/${userId}`;
            break;
          case 'supplier':
            endpoint = `${API_BASE_URL}/suppliers/${userId}`;
            break;
          case 'client':
            endpoint = `${API_BASE_URL}/clients/${userId}`;
            break;
          case 'saler':
            endpoint = `${API_BASE_URL}/salers/${userId}`;
            break;
          case 'stockkeeper':
            endpoint = `${API_BASE_URL}/stockkeepers/${userId}`;
            break;
          case 'scalemonitor':
            endpoint = `${API_BASE_URL}/scalemonitors/${userId}`;
            break;
          case 'productionmanager':
            endpoint = `${API_BASE_URL}/productionmanagers/${userId}`;
            break;
          default:
            endpoint = `${API_BASE_URL}/users/${userId}`;
        }
      }
      
      console.log(`Updating user with role ${userData.role} at endpoint: ${endpoint}`);
      const response = await axios.put(endpoint, dataToSend);
      const user = extractData(response);
      return mapUserData(user);
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  // Delete a user - with role-specific endpoint handling
  deleteUser: async (userId: string | number, role?: string) => {
    try {
      // Determine which endpoint to use based on the role
      let endpoint = `${API_BASE_URL}/users/${userId}`;
      
      if (role) {
        switch (role.toLowerCase()) {
          case 'cashier':
            endpoint = `${API_BASE_URL}/cashier/${userId}`;
            break;
          case 'blocker':
            endpoint = `${API_BASE_URL}/blockers/${userId}`;
            break;
          case 'driver':
            endpoint = `${API_BASE_URL}/drivers/${userId}`;
            break;
          case 'supplier':
            endpoint = `${API_BASE_URL}/suppliers/${userId}`;
            break;
          case 'client':
            endpoint = `${API_BASE_URL}/clients/${userId}`;
            break;
          case 'saler':
            endpoint = `${API_BASE_URL}/salers/${userId}`;
            break;
          case 'stockkeeper':
            endpoint = `${API_BASE_URL}/stockkeepers/${userId}`;
            break;
          case 'scalemonitor':
            endpoint = `${API_BASE_URL}/scalemonitors/${userId}`;
            break;
          case 'productionmanager':
            endpoint = `${API_BASE_URL}/productionmanagers/${userId}`;
            break;
          default:
            endpoint = `${API_BASE_URL}/users/${userId}`;
        }
      }
      
      console.log(`Deleting user with role ${role} at endpoint: ${endpoint}`);
      const response = await axios.delete(endpoint);
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  // Get users by role
  getUsersByRole: async (role: string) => {
    try {
      // Determine which endpoint to use based on the role
      let endpoint = `${API_BASE_URL}/users/role/${role}`;
      
      switch (role.toLowerCase()) {
        case 'cashier':
          endpoint = `${API_BASE_URL}/cashier`;
          break;
        case 'blocker':
          endpoint = `${API_BASE_URL}/blockers`;
          break;
        case 'driver':
          endpoint = `${API_BASE_URL}/drivers`;
          break;
        case 'supplier':
          endpoint = `${API_BASE_URL}/suppliers`;
          break;
        case 'client':
          endpoint = `${API_BASE_URL}/clients`;
          break;
        case 'saler':
          endpoint = `${API_BASE_URL}/salers`;
          break;
        case 'stockkeeper':
          endpoint = `${API_BASE_URL}/stockkeepers`;
          break;
        case 'scalemonitor':
          endpoint = `${API_BASE_URL}/scalemonitors`;
          break;
        case 'productionmanager':
          endpoint = `${API_BASE_URL}/productionmanagers`;
          break;
        default:
          endpoint = `${API_BASE_URL}/users/role/${role}`;
      }
      
      console.log(`Fetching users with role ${role} from endpoint: ${endpoint}`);
      const response = await axios.get(endpoint);
      const users = extractData(response);
      return users.map(mapUserData);
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      return [];
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/stats`);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {};
    }
  },

  // Cashier API methods
  // Get all cashiers
  getAllCashiers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cashier`);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching cashiers:', error);
      return [];
    }
  },

  // Get a single cashier by ID
  getCashierById: async (cashierId: string | number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cashier/${cashierId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching cashier ${cashierId}:`, error);
      return null;
    }
  },

  // Create a new cashier
  createCashier: async (cashierData: Omit<Cashier, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'user'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cashier`, cashierData);
      return extractData(response);
    } catch (error) {
      console.error('Error creating cashier:', error);
      throw error;
    }
  },

  // Update an existing cashier
  updateCashier: async (cashierId: string | number, cashierData: Partial<Cashier>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/cashier/${cashierId}`, cashierData);
      return extractData(response);
    } catch (error) {
      console.error(`Error updating cashier ${cashierId}:`, error);
      throw error;
    }
  },

  // Delete a cashier
  deleteCashier: async (cashierId: string | number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cashier/${cashierId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting cashier ${cashierId}:`, error);
      throw error;
    }
  }
}; 