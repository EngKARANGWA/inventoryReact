import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export interface Return {
  id: number;
  referenceNumber: string;
  date: string;
  returnedQuantity: string;
  note: string | null;
  saleId: number;
  productId: number;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  status: string;
  sale?: {
    id: number;
    referenceNumber: string;
    quantity: string;
    status: string;
    expectedDeliveryDate: string;
    totalPaid: string;
    totalDelivered: string;
    date: string;
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
  referenceNumber?: string; // Added this field
  productId?: number; // Added this field
  status?: string; // Added this field
  saleId: number;
  returnedQuantity: number;
  note?: string;
}

interface GetReturnsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  saleId?: number;
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
  if (axios.isAxiosError(error)) {
    console.error("API Error:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "An error occurred");
  }
  console.error("Error:", error);
  throw error;
};

export const returnsService = {
  // Create a new return
  createReturn: async (returnData: CreateReturnData): Promise<Return> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/returns`, returnData);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  updateReturn: async (
    id: number,
    returnData: CreateReturnData
  ): Promise<Return> => {
    try {
      // Ensure id is a valid number
      if (!id || isNaN(Number(id))) {
        throw new Error("Invalid return ID for update");
      }
      
      const response = await axios.put(
        `${API_BASE_URL}/returns/${id}`,
        returnData
      );
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      throw error;
    }
  },

  deleteReturn: async (id: number): Promise<void> => {
    try {
      // Ensure id is a valid number
      if (!id || isNaN(Number(id))) {
        throw new Error("Invalid return ID for deletion");
      }
      
      await axios.delete(`${API_BASE_URL}/returns/${id}`);
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
      };

      const response = await axios.get(`${API_BASE_URL}/returns`, { params });
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    } catch (error) {
      handleError(error);
      return { data: [], pagination: {} };
    }
  },

  getProducts: async (): Promise<{ data: any[] }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
      return { data: [] };
    }
  },

  getSales: async (): Promise<{ data: any[] }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`);
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
      // Validate the ID to prevent API calls with undefined
      if (!id || isNaN(Number(id))) {
        console.error("Invalid return ID:", id);
        throw new Error("Invalid return ID");
      }
      
      console.log(`Fetching return with ID: ${id}`);
      const response = await axios.get(`${API_BASE_URL}/returns/${id}`);
      
      // Extract the return data from the response
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