import api from "./authService";

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
      const response = await api.get("/stoke-movements", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw error;
    }
  },

  getStockMovementById: async (id: number): Promise<StockMovement> => {
    try {
      const response = await api.get(`/stoke-movements/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching stock movement with ID ${id}:`, error);
      throw error;
    }
  },

  createStockMovement: async (data: Partial<StockMovement>): Promise<StockMovement> => {
    try {
      const response = await api.post("/stoke-movements", data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating stock movement:", error);
      throw error;
    }
  },

  updateStockMovement: async (id: number, data: Partial<StockMovement>): Promise<StockMovement> => {
    try {
      const response = await api.put(`/stoke-movements/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating stock movement with ID ${id}:`, error);
      throw error;
    }
  },

  deleteStockMovement: async (id: number): Promise<void> => {
    try {
      await api.delete(`/stoke-movements/${id}`);
    } catch (error) {
      console.error(`Error deleting stock movement with ID ${id}:`, error);
      throw error;
    }
  },

  getAveragePrice: async (productId: number): Promise<number> => {
    try {
      const response = await api.get(`/stoke-movements/average-price/${productId}`);
      return response.data.data?.averageUnitPrice || 0;
    } catch (error) {
      console.error(`Error fetching average price for product ${productId}:`, error);
      return 0;
    }
  },
};

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get("/products");
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },

  getProductById: async (id: number): Promise<Product | null> => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return null;
    }
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.post("/products", data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating product with ID ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  },
};

export const warehouseService = {
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await api.get("/warehouses");
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return [];
    }
  },

  getWarehouseById: async (id: number): Promise<Warehouse | null> => {
    try {
      const response = await api.get(`/warehouses/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching warehouse with ID ${id}:`, error);
      return null;
    }
  },

  createWarehouse: async (data: Partial<Warehouse>): Promise<Warehouse> => {
    try {
      const response = await api.post("/warehouses", data);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creating warehouse:", error);
      throw error;
    }
  },

  updateWarehouse: async (id: number, data: Partial<Warehouse>): Promise<Warehouse> => {
    try {
      const response = await api.put(`/warehouses/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating warehouse with ID ${id}:`, error);
      throw error;
    }
  },

  deleteWarehouse: async (id: number): Promise<void> => {
    try {
      await api.delete(`/warehouses/${id}`);
    } catch (error) {
      console.error(`Error deleting warehouse with ID ${id}:`, error);
      throw error;
    }
  },
};