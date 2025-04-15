import axios from 'axios';

const API_BASE_URL = 'https://test.gvibyequ.a2hosted.com/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// interface PaginatedResponse<T> {
//   data: T[];
//   meta: {
//     current_page: number;
//     from: number;
//     last_page: number;
//     per_page: number;
//     to: number;
//     total: number;
//   };
// }

// Helper function to extract data from API response
const extractData = <T>(response: any): T => {
  if (response.data && response.data.data) {
    return response.data.data as T;
  }
  return response.data as T;
};

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get<{ data: Product[] }>(`${API_BASE_URL}/products`);
      return extractData<Product[]>(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get a single product by ID
  getProductById: async (productId: string | number): Promise<Product | null> => {
    try {
      const response = await axios.get<{ data: Product }>(`${API_BASE_URL}/products/${productId}`);
      return extractData<Product>(response);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  },

  // Create a new product
  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Product> => {
    try {
      const response = await axios.post<{ data: Product }>(`${API_BASE_URL}/products`, productData);
      return extractData<Product>(response);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId: string | number, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put<{ data: Product }>(`${API_BASE_URL}/products/${productId}`, productData);
      return extractData<Product>(response);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId: string | number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await axios.get<{ data: Product[] }>(`${API_BASE_URL}/products/category/${category}`);
      return extractData<Product[]>(response);
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      return [];
    }
  },

  // Get products by status
  getProductsByStatus: async (status: 'active' | 'inactive'): Promise<Product[]> => {
    try {
      const response = await axios.get<{ data: Product[] }>(`${API_BASE_URL}/products/status/${status}`);
      return extractData<Product[]>(response);
    } catch (error) {
      console.error(`Error fetching products by status ${status}:`, error);
      return [];
    }
  },

  // Get low stock products (quantity below threshold)
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    try {
      const response = await axios.get<{ data: Product[] }>(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`);
      return extractData<Product[]>(response);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }
};