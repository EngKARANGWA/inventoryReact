import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export interface Product {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface ProductionCost {
  description: string;
  amount: number;
}

export interface DailyPrice {
  buyingUnitPrice: number;
  sellingUnitPrice: number;
}

export interface Production {
  id: number;
  referenceNumber: string;
  productId: number;
  quantityProduced: number;
  mainProductId?: number | null;
  usedQuantity?: number | null;
  date: string;
  productionCost: ProductionCost[];
  userId: number;
  notes?: string;
  product?: Product;
  mainProduct?: Product | null;
  createdBy?: User;
  warehouseId?: number | null;
  warehouse?: Warehouse | null;
  dailyPrice?: DailyPrice | null;
  efficiency?: number;
  wastePercentage?: number;
}

interface FilterParams {
  productId?: string;
  startDate?: string;
  endDate?: string;
}

// Updated to make all fields consistent with what's being passed in handleFormSubmit
interface CreateProductionData {
  productId: number;
  quantityProduced: number;
  mainProductId?: number;
  usedQuantity?: number;
  warehouseId?: number;
  notes?: string;
  productionCost?: ProductionCost[];
  efficiency?: number;
  wastePercentage?: number;
}

// Make UpdateProductionData consistent with CreateProductionData
interface UpdateProductionData {
  productId?: number;
  quantityProduced?: number;
  mainProductId?: number;
  usedQuantity?: number;
  warehouseId?: number;
  notes?: string;
  productionCost?: ProductionCost[];
  efficiency?: number;
  wastePercentage?: number;
}

export const productionService = {
  createProduction: async (data: CreateProductionData): Promise<Production> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/production`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to create production"
        );
      }
      throw new Error("Failed to create production");
    }
  },

  getAllProductions: async (
    page = 1,
    pageSize = 10,
    search = "",
    filters: FilterParams = {}
  ): Promise<{
    rows: Production[];
    count: number;
  }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/production`, {
        params: {
          page,
          pageSize,
          search,
          ...filters,
        },
      });
      return {
        rows: response.data.data || [],
        count: response.data.pagination?.total || 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch productions"
        );
      }
      throw new Error("Failed to fetch productions");
    }
  },

  getProductionById: async (id: number): Promise<Production> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/production/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Production not found"
        );
      }
      throw new Error("Production not found");
    }
  },

  updateProduction: async (
    id: number,
    data: UpdateProductionData
  ): Promise<Production> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/production/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to update production"
        );
      }
      throw new Error("Failed to update production");
    }
  },

  deleteProduction: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/production/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to delete production"
        );
      }
      throw new Error("Failed to delete production");
    }
  },
};