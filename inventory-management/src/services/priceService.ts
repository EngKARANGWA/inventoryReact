import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Price {
  id: number;
  unitPrice: string;
  date: string;
  productId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  product: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

export interface PriceHistory {
  id: number;
  priceId: number;
  productId: number;
  oldPrice: number;
  newPrice: number;
  changeType: 'base' | 'discount' | 'special';
  changedAt: string;
  changedBy: string;
}

class PriceService {
  private baseUrl = `${API_BASE_URL}/daily-price`; // Changed from /daily-prices to /daily-price

  async getAllPrices(): Promise<Price[]> {
    try {
      const response = await axios.get<Price[]>(this.baseUrl);
      console.log('API Response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('Error fetching prices:', {
        message: error.message,
        url: this.baseUrl,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Return mock data when API is unavailable
      console.log('Using mock data as fallback');
      return this.getMockPrices();
    }
  }

  // Mock data for development/testing
  private getMockPrices(): Price[] {
    return [
      {
        id: 1,
        unitPrice: "1500",
        date: "2023-01-15",
        productId: 1,
        createdAt: "2023-01-15T10:00:00Z",
        updatedAt: "2023-01-15T10:00:00Z",
        deletedAt: null,
        product: {
          id: 1,
          name: "Product A",
          description: "Description for Product A",
          createdAt: "2023-01-01T00:00:00Z",
          updatedAt: "2023-01-01T00:00:00Z",
          deletedAt: null
        }
      },
      {
        id: 2,
        unitPrice: "2500",
        date: "2023-02-20",
        productId: 2,
        createdAt: "2023-02-20T14:30:00Z",
        updatedAt: "2023-02-20T14:30:00Z",
        deletedAt: null,
        product: {
          id: 2,
          name: "Product B",
          description: "Description for Product B",
          createdAt: "2023-01-05T00:00:00Z",
          updatedAt: "2023-01-05T00:00:00Z",
          deletedAt: null
        }
      },
      {
        id: 3,
        unitPrice: "3500",
        date: "2023-03-10",
        productId: 3,
        createdAt: "2023-03-10T09:15:00Z",
        updatedAt: "2023-03-10T09:15:00Z",
        deletedAt: null,
        product: {
          id: 3,
          name: "Product C",
          description: "Description for Product C",
          createdAt: "2023-01-10T00:00:00Z",
          updatedAt: "2023-01-10T00:00:00Z",
          deletedAt: null
        }
      }
    ];
  }

  async getPriceById(id: number): Promise<Price> {
    try {
      const response = await axios.get<Price>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching price with ID ${id}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch price ${id}: ${error.message}`);
    }
  }

  async getPricesByProductId(productId: number): Promise<Price[]> {
    try {
      const response = await axios.get<Price[]>(`${this.baseUrl}/product/${productId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching prices for product ${productId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch prices for product ${productId}: ${error.message}`);
    }
  }

  async createPrice(priceData: Omit<Price, 'id' | 'createdAt' | 'updatedAt' | 'product'> & { productId: number }): Promise<Price> {
    try {
      const response = await axios.post<Price>(this.baseUrl, priceData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating price:', error.response?.data || error.message);
      throw new Error(`Failed to create price: ${error.message}`);
    }
  }

  async updatePrice(id: number, priceData: Partial<Price>): Promise<Price> {
    try {
      const response = await axios.put<Price>(`${this.baseUrl}/${id}`, priceData);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating price with ID ${id}:`, error.response?.data || error.message);
      throw new Error(`Failed to update price ${id}: ${error.message}`);
    }
  }

  async deletePrice(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      console.error(`Error deleting price with ID ${id}:`, error.response?.data || error.message);
      throw new Error(`Failed to delete price ${id}: ${error.message}`);
    }
  }

  async getPriceHistory(priceId: number): Promise<PriceHistory[]> {
    try {
      const response = await axios.get<PriceHistory[]>(`${this.baseUrl}/${priceId}/history`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching price history for ID ${priceId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch price history for ${priceId}: ${error.message}`);
    }
  }

  async applyDiscount(id: number, discountPercentage: number): Promise<Price> {
    try {
      const response = await axios.post<Price>(`${this.baseUrl}/${id}/discount`, { discountPercentage });
      return response.data;
    } catch (error: any) {
      console.error(`Error applying discount to price with ID ${id}:`, error.response?.data || error.message);
      throw new Error(`Failed to apply discount to price ${id}: ${error.message}`);
    }
  }

  async setSpecialOffer(
    id: number, 
    isSpecialOffer: boolean, 
    startDate?: string, 
    endDate?: string
  ): Promise<Price> {
    try {
      const response = await axios.post<Price>(`${this.baseUrl}/${id}/special-offer`, {
        isSpecialOffer,
        startDate,
        endDate
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error setting special offer for price with ID ${id}:`, error.response?.data || error.message);
      throw new Error(`Failed to set special offer for price ${id}: ${error.message}`);
    }
  }
}

export const priceService = new PriceService();