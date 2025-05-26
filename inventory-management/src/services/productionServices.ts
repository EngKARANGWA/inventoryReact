import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken
        });
        
        // If refresh successful, update tokens and retry original request
        if (res.data?.success) {
          localStorage.setItem('token', res.data.token);
          
          // Update authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export interface Product {
  id: number;
  name: string;
  description?: string;
  type?: string;
  unit?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  profile?: {
    names?: string;
    phoneNumber?: string;
  };
}

export interface Warehouse {
  id: number;
  name: string;
  location?: string;
  capacity?: number;
  currentOccupancy?: number;
  status?: string;
  managerId?: number;
}

export interface ProductionCost {
  item?: string;
  name?: string;
  description?: string;
  total?: number;
  cost?: number;
  amount?: number;
  price?: number;
  quantity?: number;
  unitPrice?: number;
}

export interface DailyPrice {
  buyingUnitPrice: number;
  sellingUnitPrice: number;
}

export interface ProductionOutcome {
  id?: number;
  productionId?: number;
  outcomeType: 'finished_product' | 'byproduct' | 'loss';
  name: string;
  quantity: number;
  unit: string;
  productId?: number;
  unitPrice?: number;
  warehouseId?: number;
  notes?: string;
  product?: Product;
  warehouse?: Warehouse;
  stockMovement?: any;
}

export interface PackageSummary {
  size?: string;        // Backend expects 'size'
  packageSize?: string; // Frontend uses 'packageSize'
  quantity: number;
  totalWeight: number;
  unit?: string;
}

export interface OutcomesSummary {
  finished: number;
  byproducts: number;
  loss: number;
}

export interface StockMovement {
  id: number;
  referenceNumber: string;
  productId: number;
  quantity: string;
  unitPrice: string;
  direction: 'in' | 'out';
  warehouseId: number;
  sourceType: string;
  productionId?: number;
  movementDate: string;
  userId: number;
  notes?: string;
  product?: Product;
  warehouse?: Warehouse;
  productionOutcome?: ProductionOutcome;
}

export interface Production {
  id: number;
  referenceNumber: string;
  productId: number;
  quantityProduced: number;
  totalOutcome: number;
  mainProductId?: number | null;
  usedQuantity?: number | null;
  mainProductUnitCost?: number | null;
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
  productionLoss?: number;
  outcomes?: ProductionOutcome[];
  packagesSummary?: PackageSummary[];
  outcomesSummary?: OutcomesSummary;
  stockMovements?: StockMovement[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface FilterParams {
  productId?: string | number;
  mainProductId?: string | number;
  startDate?: string;
  endDate?: string;
  warehouseId?: string | number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Create production data interface
interface CreateProductionData {
  productId: number;
  productName?: string;
  quantityProduced: number;
  totalOutcome: number;
  mainProductId?: number;
  usedQuantity?: number;
  mainProductUnitCost?: number;
  warehouseId?: number;
  notes?: string;
  productionCost?: ProductionCost[];
  outcomes?: ProductionOutcome[];
  packagesSummary?: PackageSummary[];
  date?: string;
}

// Update production data interface
interface UpdateProductionData {
  productId?: number;
  productName?: string;
  quantityProduced?: number;
  totalOutcome?: number;
  mainProductId?: number;
  usedQuantity?: number;
  mainProductUnitCost?: number;
  warehouseId?: number;
  notes?: string;
  productionCost?: ProductionCost[];
  outcomes?: ProductionOutcome[];
  packagesSummary?: PackageSummary[];
  date?: string;
}

export const productionService = {
  createProduction: async (data: CreateProductionData): Promise<Production> => {
    try {
      // Format the data to match backend expectations
      const formattedData = {
        ...data,
        // Ensure outcomes are properly formatted
        outcomes: data.outcomes?.map(outcome => ({
          outcomeType: outcome.outcomeType,
          ...(outcome.outcomeType === 'byproduct' && outcome.productId 
            ? { productId: Number(outcome.productId) }
            : {}),
          name: outcome.name || 'Processing Loss',
          quantity: Number(outcome.quantity),
          unit: outcome.unit || 'kg',
          ...(outcome.outcomeType === 'byproduct' && outcome.unitPrice !== undefined
            ? { unitPrice: Number(outcome.unitPrice) }
            : {}),
          ...(outcome.warehouseId
            ? { warehouseId: Number(outcome.warehouseId) }
            : {}),
          ...(outcome.notes ? { notes: outcome.notes } : {})
        })),
        // Map packageSize to size for backend
        packagesSummary: data.packagesSummary?.map(pkg => ({
          size: pkg.packageSize || pkg.size,
          quantity: Number(pkg.quantity),
          totalWeight: Number(pkg.totalWeight),
          unit: pkg.unit || 'kg'
        })),
        // Format production costs
        productionCost: data.productionCost?.map(cost => {
          const quantity = Number(cost.quantity) || 1;
          const unitPrice = Number(cost.unitPrice) || 0;
          const total = Number(cost.total || cost.cost || cost.amount || cost.price || 0);
          
          return {
            item: cost.item || cost.name || cost.description || '',
            quantity: quantity,
            unitPrice: unitPrice,
            total: total
          };
        })
      };

      const response = await api.post(`/production`, formattedData);
      
      // Handle different response structures
      const responseData = response.data.data || response.data;
      
      // Ensure the response has all expected fields
      return {
        ...responseData,
        totalOutcome: responseData.totalOutcome || responseData.quantityProduced,
        quantityProduced: responseData.quantityProduced || responseData.totalOutcome,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Production creation error:', error.response?.data);
        
        // Handle validation errors
        if (error.response?.data?.errors) {
          const validationError = error.response.data.errors[0];
          throw new Error(validationError.msg || "Validation error");
        }
        
        throw new Error(
          error.response?.data?.message || 
          error.response?.data?.error ||
          "Failed to create production"
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
      // Process filters to ensure backend compatibility
      const processedFilters: Record<string, any> = {};
      
      // Handle string or number values consistently
      if (filters.productId !== undefined) {
        processedFilters.productId = filters.productId.toString();
      }
      
      if (filters.mainProductId !== undefined) {
        processedFilters.mainProductId = filters.mainProductId.toString();
      }
      
      if (filters.warehouseId !== undefined) {
        processedFilters.warehouseId = filters.warehouseId.toString();
      }
      
      // Handle date filters - support both naming conventions
      if (filters.startDate) {
        processedFilters.startDate = filters.startDate;
      } else if (filters.dateFrom) {
        processedFilters.startDate = filters.dateFrom;
      }
      
      if (filters.endDate) {
        processedFilters.endDate = filters.endDate;
      } else if (filters.dateTo) {
        processedFilters.endDate = filters.dateTo;
      }
      
      if (filters.status) {
        processedFilters.status = filters.status;
      }
      
      const response = await api.get(`/production`, {
        params: {
          page,
          pageSize,
          search,
          ...processedFilters,
        },
      });
      
      // Map the response data to ensure compatibility
      const productions = (response.data.data || []).map((prod: any) => ({
        ...prod,
        totalOutcome: prod.totalOutcome || prod.quantityProduced,
        quantityProduced: prod.quantityProduced || prod.totalOutcome,
      }));
      
      return {
        rows: productions,
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
      const response = await api.get(`/production/${id}`);
      const responseData = response.data.data || response.data;
      
      // Ensure compatibility
      return {
        ...responseData,
        totalOutcome: responseData.totalOutcome || responseData.quantityProduced,
        quantityProduced: responseData.quantityProduced || responseData.totalOutcome,
      };
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
      // Format the data similar to create
      const formattedData = {
        ...data,
        // Ensure quantityProduced is included if totalOutcome is provided
        ...(data.totalOutcome ? { quantityProduced: data.totalOutcome } : {}),
        outcomes: data.outcomes?.map(outcome => ({
          outcomeType: outcome.outcomeType,
          ...(outcome.outcomeType === 'byproduct' && outcome.productId 
            ? { productId: Number(outcome.productId) }
            : {}),
          name: outcome.name || 'Processing Loss',
          quantity: Number(outcome.quantity),
          unit: outcome.unit || 'kg',
          ...(outcome.outcomeType === 'byproduct' && outcome.unitPrice !== undefined
            ? { unitPrice: Number(outcome.unitPrice) }
            : {}),
          ...(outcome.warehouseId
            ? { warehouseId: Number(outcome.warehouseId) }
            : {}),
          ...(outcome.notes ? { notes: outcome.notes } : {})
        })),
        packagesSummary: data.packagesSummary?.map(pkg => ({
          size: pkg.packageSize || pkg.size,
          quantity: Number(pkg.quantity),
          totalWeight: Number(pkg.totalWeight),
          unit: pkg.unit || 'kg'
        })),
        productionCost: data.productionCost?.map(cost => {
          const quantity = Number(cost.quantity) || 1;
          const unitPrice = Number(cost.unitPrice) || 0;
          const total = Number(cost.total || cost.cost || cost.amount || cost.price || 0);
          
          return {
            item: cost.item || cost.name || cost.description || '',
            quantity: quantity,
            unitPrice: unitPrice,
            total: total
          };
        })
      };

      const response = await api.put(
        `/production/${id}`,
        formattedData
      );
      
      const responseData = response.data.data || response.data;
      
      return {
        ...responseData,
        totalOutcome: responseData.totalOutcome || responseData.quantityProduced,
        quantityProduced: responseData.quantityProduced || responseData.totalOutcome,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Production update error:', error.response?.data);
        
        // Handle validation errors
        if (error.response?.data?.errors) {
          const validationError = error.response.data.errors[0];
          throw new Error(validationError.msg || "Validation error");
        }
        
        throw new Error(
          error.response?.data?.message || "Failed to update production"
        );
      }
      throw new Error("Failed to update production");
    }
  },

  deleteProduction: async (id: number): Promise<void> => {
    try {
      await api.delete(`/production/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to delete production"
        );
      }
      throw new Error("Failed to delete production");
    }
  },

  restoreProduction: async (id: number): Promise<Production> => {
    try {
      const response = await api.post(`/production/${id}/restore`);
      const responseData = response.data.data || response.data;
      
      return {
        ...responseData,
        totalOutcome: responseData.totalOutcome || responseData.quantityProduced,
        quantityProduced: responseData.quantityProduced || responseData.totalOutcome,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to restore production"
        );
      }
      throw new Error("Failed to restore production");
    }
  },

  getProductionStats: async (params?: {
    startDate?: string;
    endDate?: string;
    productId?: number;
  }): Promise<{
    totalProductions: number;
    totalQuantity: number;
    productionByProduct: any[];
    efficiency: any;
    outcomeBreakdown: any[];
  }> => {
    try {
      const response = await api.get(`/production/stats`, {
        params,
      });
      
      return response.data.data || response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch production statistics"
        );
      }
      throw new Error("Failed to fetch production statistics");
    }
  },

  // Helper function to transform backend data to frontend format
  transformBackendData: (data: any): Production => {
    return {
      ...data,
      totalOutcome: data.totalOutcome || data.quantityProduced,
      quantityProduced: data.quantityProduced || data.totalOutcome,
      // Map backend package structure to frontend
      packagesSummary: data.packagesSummary?.map((pkg: any) => ({
        ...pkg,
        packageSize: pkg.size, // Map backend 'size' to frontend 'packageSize'
      })),
    };
  },

  // Helper function to transform frontend data to backend format
  transformFrontendData: (data: any): any => {
    return {
      ...data,
      quantityProduced: data.totalOutcome || data.quantityProduced,
      packagesSummary: data.packagesSummary?.map((pkg: any) => ({
        ...pkg,
        size: pkg.packageSize, // Map frontend 'packageSize' to backend 'size'
      })),
    };
  },
};

// Authentication service functions
export const authService = {
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { usernameOrEmail, password });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset request failed';
      throw new Error(message);
    }
  },

  resetPassword: async (token: string, email: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password reset failed';
      throw new Error(message);
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      // Call the logout endpoint (optional, since JWT is stateless)
      await api.post('/auth/logout');
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return { success: true };
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      console.error('Logout error:', error);
      return { success: true };
    }
  },

  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    
    try {
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default api;