import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Product {
  id: number;
  name: string;
  description: string;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

interface UserProfile {
  names: string;
  phoneNumber: string;
  address: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}

interface StockSnapshot {
  id: number;
  quantity: string;
  snapshotDate: string;
}

export interface StockMovement {
  id: number;
  referenceNumber: string;
  productId: number;
  quantity: string;
  direction: "in" | "out";
  warehouseId: number;
  sourceType: "production" | "delivery" | "transfer" | "sale" | "returns" | "disposal";
  deliveryId?: number | null;
  productionId?: number | null;
  transferId?: number | null;
  saleId?: number | null;
  returnsId?: number | null;
  disposalId?: number | null;
  movementDate: string;
  userId: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: Product;
  warehouse: Warehouse;
  user: User;
  resultingSnapshot: StockSnapshot;
}

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  data: StockMovement[];
  pagination: Pagination;
}

export const stockMovementService = {
  getAllStockMovements: async (params: any = {}): Promise<ApiResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stoke-movements`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw error;
    }
  },
};

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
};

export const warehouseService = {
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouses`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return [];
    }
  },
};