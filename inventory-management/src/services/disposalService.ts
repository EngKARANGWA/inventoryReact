import api  from './authService';

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
  unitPrice?: number; 
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
      const response = await api.post('/disposal', disposalData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating disposal:", error);
      throw error;
    }
  },

  getAllDisposals: async (
    options?: DisposalFilterOptions
  ): Promise<DisposalResponse> => {
    try {
      const response = await api.get('/disposal', { params: options });
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
      const response = await api.get(`/disposal/${id}`, {
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
      const response = await api.put(`/disposal/${id}`, disposalData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating disposal:", error);
      throw error;
    }
  },

  deleteDisposal: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/disposal/${id}`);
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
      const response = await api.get('/products');
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
};

export const warehouseService = {
  getAllWarehouses: async (): Promise<Warehouse[]> => {
    try {
      const response = await api.get('/warehouse');
      return response.data || [];
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      return [];
    }
  },
};

export const priceService = {
  getAveragePriceForProduct: async (productId: number): Promise<{
    productId: number;
    averageUnitPrice: number | null;
  } | null> => {
    try {
      const response = await api.get(`/stoke-movements/average-price/${productId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error("Error fetching average price:", error);
      return null;
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