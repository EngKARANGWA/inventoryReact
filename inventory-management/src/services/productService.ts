import api from './authService';

export interface Product {
  id: number;
  name: string;
  description: string;
  type: 'raw_material' | 'finished_product' | 'raw_and_finished';
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
      const response = await api.get<{ 
        data: Product[];
        pagination: {
          page: number;
          pageSize: number;
          totalItems: number;
          totalPages: number;
        }
      }>('/products', { params: options });
      
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
      const response = await api.get<{ data: Product }>(
        `/products/${productId}`,
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
      const response = await api.post<{ data: Product }>('/products', productData);
      return extractData<Product>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId: string | number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.put<{ data: Product }>(
        `/products/${productId}`,
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
      await api.delete(`/products/${productId}`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  restoreProduct: async (productId: string | number): Promise<void> => {
    try {
      await api.post(`/products/${productId}/restore`);
    } catch (error) {
      console.error(`Error restoring product ${productId}:`, error);
      throw error;
    }
  },

  getProductStockLevels: async (productId: string | number): Promise<any> => {
    try {
      const response = await api.get(`/products/${productId}/stock`);
      return extractData<any>(response);
    } catch (error) {
      console.error(`Error fetching stock levels for product ${productId}:`, error);
      throw error;
    }
  }
};