import axios from 'axios';

const API_BASE_URL = 'https://test.gvibyequ.a2hosted.com/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  type: 'raw_material' | 'finished_product';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const extractData = <T>(response: any): T => {
  if (response.data && response.data.data) {
    return response.data.data as T;
  }
  return response.data as T;
};

export const productService = {
  getAllProducts: async (options?: {
    page?: number;
    pageSize?: number;
    type?: string;
    includeDeleted?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<Product>> => {
    try {
      const response = await axios.get<{ 
        data: Product[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        }
      }>(`${API_BASE_URL}/products`, { params: options });
      
      return {
        data: extractData<Product[]>(response),
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (productId: string | number, includeDeleted: boolean = false): Promise<Product | null> => {
    try {
      const response = await axios.get<{ data: Product }>(
        `${API_BASE_URL}/products/${productId}`,
        { params: { includeDeleted } }
      );
      return extractData<Product>(response);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product> => {
    try {
      const response = await axios.post<{ data: Product }>(`${API_BASE_URL}/products`, productData);
      return extractData<Product>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId: string | number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put<{ data: Product }>(
        `${API_BASE_URL}/products/${productId}`,
        productData
      );
      return extractData<Product>(response);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  deleteProduct: async (productId: string | number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  restoreProduct: async (productId: string | number): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/products/${productId}/restore`);
    } catch (error) {
      console.error(`Error restoring product ${productId}:`, error);
      throw error;
    }
  },

  getProductStockLevels: async (productId: string | number): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}/stock`);
      return extractData<any>(response);
    } catch (error) {
      console.error(`Error fetching stock levels for product ${productId}:`, error);
      throw error;
    }
  }
};