import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface SaleItem {
  id?: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalDelivered?: string;
  note?: string;
  product?: {
    id: number;
    name: string;
    type?: string;
  };
}

export interface Sale {
  id: number;
  saleReference: string | null;
  totalAmount: string;
  status: string;
  expectedDeliveryDate: string;
  totalPaid: string;
  note: string;
  createdAt: string;
  salerId: number;
  clientId?: number;
  blockerId?: number;
  items: SaleItem[];
  saler: {
    id: number;
    user: {
      profile: {
        names: string;
      };
    };
  };
  client?: {
    id: number;
    clientId?: string;
    user?: {
      profile?: {
        names: string;
      };
    };
  } | null;
}

interface CreateSaleItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  note?: string;
}

interface CreateSaleData {
  salerId: number;
  clientId?: number;
  blockerId?: number;
  items: CreateSaleItem[];
  expectedDeliveryDate?: string;
  note?: string;
  status?: string;
}

interface UpdateSaleData {
  salerId?: number;
  clientId?: number;
  blockerId?: number;
  items?: {
    id?: number;
    productId?: number;
    quantity?: number;
    unitPrice?: number;
    note?: string;
  }[];
  expectedDeliveryDate?: string;
  note?: string;
  status?: string;
}

interface SaleResponse {
  success: boolean;
  data: Sale[];
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export const saleService = {
  getAllSales: async (params?: any): Promise<SaleResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
      throw error;
    }
  },

  getSaleById: async (id: number): Promise<Sale> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error);
      throw error;
    }
  },

  createSale: async (saleData: CreateSaleData): Promise<Sale> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sales`, saleData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating sale:", error);
      throw error;
    }
  },

  updateSale: async (id: number, saleData: UpdateSaleData): Promise<Sale> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/sales/${id}`, saleData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating sale:", error);
      throw error;
    }
  },

  deleteSale: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/sales/${id}`);
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  },
};