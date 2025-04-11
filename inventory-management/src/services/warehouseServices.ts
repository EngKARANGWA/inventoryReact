import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export interface WarehouseManager {
  id: number;
  warehouseAccessLevel: string;
  warehouseId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user_id: number;
  warehouse_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
    };
  };
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: "active" | "inactive";
  managerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  description?: string;
  manager: WarehouseManager | null;
  scaleMonitor: any | null;
}

interface CreateWarehouseData {
  name: string;
  location: string;
  capacity: number;
  description?: string;
}

interface UpdateWarehouseData {
  name?: string;
  location?: string;
  capacity?: number;
  description?: string;
  status?: "active" | "inactive";
}

interface ChangeManagerData {
  managerId: number | null;
}

// Helper function to handle API responses
const handleResponse = (response: any) => {
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data) {
    return response.data;
  }
  return response;
};

// Helper function to handle errors
const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
  console.error("Error:", error);
  throw error;
};

export const warehouseService = {
  // Create a new warehouse
  createWarehouse: async (
    warehouseData: CreateWarehouseData
  ): Promise<Warehouse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/warehouse`,
        warehouseData
      );
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get all warehouses
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouse`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  // Get a single warehouse by ID
  getWarehouseById: async (id: number): Promise<Warehouse | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouse/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  // Update a warehouse
  updateWarehouse: async (
    id: number,
    warehouseData: UpdateWarehouseData
  ): Promise<Warehouse> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/warehouse/${id}`,
        warehouseData
      );
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Change warehouse manager
  changeManager: async (
    warehouseId: number,
    data: { newManagerId: number }
  ): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE_URL}/warehouse/${warehouseId}/change-manager`,
        {
          newManagerId: data.newManagerId,
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to change manager"
        );
      }
      throw new Error("Failed to change manager");
    }
  },

  // Delete a warehouse
  deleteWarehouse: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/warehouse/${id}`);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  },

  // Restore a warehouse
  restoreWarehouse: async (id: number): Promise<Warehouse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/warehouse/${id}/restore`
      );
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};
