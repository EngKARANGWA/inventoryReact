import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export interface Sale {
  id: number;
  saleReference: string | null;
  quantity: number;
  status: string;
  expectedDeliveryDate: string | null;
  totalPaid: string;
  totalDelivered: string;
  note: string | null;
  dailyPriceId: number | null;
  salerId: number;
  clientId: number | null;
  productId: number;
  blockerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: Product;
  saler: Saler;
  dailyPrice: DailyPrice | null;
  client: any | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Saler {
  id: number;
  salerId: string;
  tinNumber: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: User;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}

interface UserProfile {
  id: number;
  names: string;
  phoneNumber: string;
  address: string;
  status: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface DailyPrice {
  id: number;
  buyingUnitPrice: string;
  sellingUnitPrice: string;
  date: string;
  productId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product: Product;
}

interface CreateSaleData {
  productId: number;
  quantity: number;
  salerId: number;
  priceId: number;
  clientId?: number;
  note?: string;
  date?: string;
}

interface UpdateSaleData {
  quantity?: number;
  note?: string;
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
  getAllSales: async (filters: any = {}): Promise<SaleResponse> => {
    try {
      const params = {
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
        search: filters.search,
        productId: filters.productId,
        salerId: filters.salerId,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const response = await axios.get(`${API_BASE_URL}/sales`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales:", error);
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