import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Disposal {
  id: number;
  referenceNumber: string;
  productId: number;
  priceId: number;
  quantity: number;
  date: string;
  method:
    | "destroyed"
    | "donated"
    | "recycled"
    | "returned_to_supplier"
    | "expired"
    | "damaged"
    | "other";
  note: string | null;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product?: {
    id: number;
    name: string;
    description: string;
  };
  warehouse?: {
    id: number;
    name: string;
    location: string;
  };
  price?: {
    id: number;
    buyingUnitPrice: number | null;
    sellingUnitPrice: number | null;
    date: string;
  };
}

interface CreateDisposalData {
  productId: number;
  warehouseId: number;
  quantity: number;
  method: string;
  note?: string;
  date?: string;
}

interface UpdateDisposalData {
  quantity?: number;
  method?: string;
  note?: string;
  date?: string;
}

export interface DisposalFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  method?: string;
  productId?: number;
  warehouseId?: number;
  startDate?: string;
  endDate?: string;
  includeDeleted?: boolean;
}

interface DisposalResponse {
  success: boolean;
  data: Disposal[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const disposalService = {
  createDisposal: async (
    disposalData: CreateDisposalData
  ): Promise<Disposal> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/disposal`,
        disposalData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating disposal:", error);
      throw error;
    }
  },

  getAllDisposals: async (
  ): Promise<DisposalResponse> => {
    try {


      const response = await axios.get(`${API_BASE_URL}/disposal`);
      return response.data;
    } catch (error) {
      console.error("Error fetching disposals:", error);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
    }
  },

  getDisposalById: async (
    id: number,
    includeDeleted: boolean = false
  ): Promise<Disposal | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/disposal/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching disposal:", error);
      return null;
    }
  },

  updateDisposal: async (
    id: number,
    disposalData: UpdateDisposalData
  ): Promise<Disposal> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/disposal/${id}`,
        disposalData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating disposal:", error);
      throw error;
    }
  },

  deleteDisposal: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/disposal/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting disposal:", error);
      return false;
    }
  },
};

// Additional services for dropdowns
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
      const response = await axios.get(`${API_BASE_URL}/warehouse`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return [];
    }
  },
};

export const priceService = {
  getPricesByProduct: async (productId: number): Promise<Price[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/daily-price`, {
        params: { productId },
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching prices:", error);
      return [];
    }
  },
};

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

export interface Price {
  id: number;
  buyingUnitPrice?: number | null;
  sellingUnitPrice?: number | null;
  date: string;
  productId: number;
  product?: Product;
}
