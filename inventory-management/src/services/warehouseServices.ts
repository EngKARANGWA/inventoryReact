import axios from "axios";
import api from './authService';

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
  status?: "active" | "inactive";
}

interface UpdateWarehouseData {
  name?: string;
  location?: string;
  capacity?: number;
  description?: string;
  status?: "active" | "inactive";
}

const handleResponse = (response: any) => {
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data) {
    return response.data;
  }
  return response;
};

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
  console.error("Error:", error);
  throw error;
};

export const warehouseService = {
  createWarehouse: async (
    warehouseData: CreateWarehouseData
  ): Promise<Warehouse> => {
    try {
      const response = await api.post(`/warehouse`, warehouseData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await api.get(`/warehouse`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return [];
    }
  },

  getWarehouseById: async (id: number): Promise<Warehouse | null> => {
    try {
      const response = await api.get(`/warehouse/${id}`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return null;
    }
  },

  updateWarehouse: async (
    id: number,
    warehouseData: UpdateWarehouseData
  ): Promise<Warehouse> => {
    try {
      const response = await api.put(`/warehouse/${id}`, warehouseData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  changeManager: async (
    warehouseId: number,
    data: { newManagerId: number }
  ): Promise<void> => {
    try {
      await api.post(`/warehouse/${warehouseId}/change-manager`, {
        newManagerId: data.newManagerId,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to change manager"
        );
      }
      throw new Error("Failed to change manager");
    }
  },

  deleteWarehouse: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/warehouse/${id}`);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  },

  restoreWarehouse: async (id: number): Promise<Warehouse> => {
    try {
      const response = await api.post(`/warehouse/${id}/restore`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },
};