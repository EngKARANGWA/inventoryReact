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

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

// Helper function to extract data from API response
const extractData = <T>(response: any): T => {
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

export const productService = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await axios.get<PaginatedResponse<Product>>(`${API_BASE_URL}/products`);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get a single product by ID
  getProductById: async (productId: string | number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  },

  // Create a new product
  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/products`, productData);
      return extractData(response);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update an existing product
  updateProduct: async (productId: string | number, productData: Partial<Product>) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData);
      return extractData(response);
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  },

  // Delete a product
  deleteProduct: async (productId: string | number) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/products/${productId}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/category/${category}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching products by category ${category}:`, error);
      return [];
    }
  },

  // Get products by status
  getProductsByStatus: async (status: 'active' | 'inactive') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/status/${status}`);
      return extractData(response);
    } catch (error) {
      console.error(`Error fetching products by status ${status}:`, error);
      return [];
    }
  },

  // Get low stock products (quantity below threshold)
  getLowStockProducts: async (threshold: number = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`);
      return extractData(response);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }
}; 