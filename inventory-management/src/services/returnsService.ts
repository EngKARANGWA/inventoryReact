import api from './authService';

export interface Return {
  id: number;
  referenceNumber: string;
  date: string;
  returnedQuantity: string;
  note: string | null;
  saleId: number;
  saleItemId: number;
  productId: number;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: string;
  sale?: {
    id: number;
    referenceNumber: string;
    status: string;
    expectedDeliveryDate: string;
    totalPaid: string;
    totalDelivered: string;
    date: string;
    items?: Array<{
      id: number;
      quantity: string;
      unitPrice: string;
      productId: number;
      product?: {
        id: number;
        name: string;
        description: string;
      };
    }>;
  };
  saleItem?: {
    id: number;
    quantity: string;
    unitPrice: string;
    totalDelivered: string;
    note: string | null;
    productId: number;
  };
  product?: {
    id: number;
    name: string;
    description: string;
  };
  stockMovements?: Array<{
    id: number;
    referenceNumber: string;
    productId: number;
    quantity: string;
    direction: "in" | "out";
    warehouseId: number;
    sourceType: string;
    movementDate: string;
    notes: string;
    warehouse: {
      id: number;
      name: string;
    };
  }>;
}

export interface CreateReturnData {
  saleId: number;
  saleItemId: number;
  returnedQuantity: number;
  note?: string;
  status?: string;
  warehouseId?: number;
}

interface GetReturnsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  saleId?: number;
  saleItemId?: number;
  productId?: number;
  includeDeleted?: boolean;
}

// Helper function to handle API responses
const handleResponse = (response: any) => {
  if (response.data && response.data.data) {
    return response.data.data;
  } else if (response.data) {
    return response.data;
  }
  return response;
};

// Helper function to handle errors
const handleError = (error: any) => {
  if (error.response) {
    console.error("API Error:", error.response.data?.message || error.message);
    throw new Error(error.response.data?.message || "An error occurred");
  }
  console.error("Error:", error);
  throw error;
};

export const returnsService = {
  // Create a new return
  createReturn: async (returnData: CreateReturnData): Promise<Return> => {
    try {
      if (!returnData.saleItemId) {
        throw new Error("Sale item ID is required");
      }
      
      const response = await api.post('/returns', returnData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Update an existing return
  updateReturn: async (
    id: number,
    returnData: CreateReturnData
  ): Promise<Return> => {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("Invalid return ID for update");
      }
      
      if (returnData.saleItemId === undefined || returnData.saleItemId === null) {
        console.warn("Sale item ID should be provided for update");
      }
      
      const response = await api.put(`/returns/${id}`, returnData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Delete a return
  deleteReturn: async (id: number): Promise<void> => {
    try {
      if (!id || isNaN(Number(id))) {
        throw new Error("Invalid return ID for deletion");
      }
      
      await api.delete(`/returns/${id}`);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  // Get all returns with pagination
  getAllReturns: async (
    options: GetReturnsOptions = {}
  ): Promise<{ data: Return[]; pagination: any }> => {
    try {
      const params = {
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        includeDeleted: options.includeDeleted ? "true" : "false",
        search: options.search,
        saleId: options.saleId,
        saleItemId: options.saleItemId,
        productId: options.productId,
      };

      const response = await api.get('/returns', { params });
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    } catch (error) {
      handleError(error);
      return { data: [], pagination: {} };
    }
  },

  // Get products
  getProducts: async (): Promise<{ data: any[] }> => {
    try {
      const response = await api.get('/products');
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  },

  // Get sales
  getSales: async (): Promise<{ data: any[] }> => {
    try {
      const response = await api.get('/sales', {
        params: {
          include: "items,products"
        }
      });
      return {
        data: response.data?.data || []
      };
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  },

  // Get a single return by ID
  getReturnById: async (id: number): Promise<Return | null> => {
    try {
      if (!id || isNaN(Number(id))) {
        console.error("Invalid return ID:", id);
        throw new Error("Invalid return ID");
      }
      
      console.log(`Fetching return with ID: ${id}`);
      const response = await api.get(`/returns/${id}`);
      
      const returnData = handleResponse(response);
      console.log("Return data fetched successfully");
      
      return returnData;
    } catch (error) {
      console.error(`Error fetching return with ID ${id}:`, error);
      handleError(error);
      return null;
    }
  },
};