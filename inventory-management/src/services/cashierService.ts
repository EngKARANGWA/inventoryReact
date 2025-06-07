import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Helper function to extract data from API response
const extractData = (response: any): any => {
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data?.rows) {
    return response.data.rows;
  }
  if (response.data) {
    return response.data;
  }
  return response;
};

export const cashierService = {
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