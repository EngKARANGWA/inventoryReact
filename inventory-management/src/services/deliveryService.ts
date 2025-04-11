import axios from 'axios';

export interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    accountStatus: string;
    isDefaultPassword: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    profile: {
      id: number;
      names: string;
      phoneNumber: string;
      address: string;
      status: string;
      userId: number;
      user_id: number;
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
  };
}

export interface Purchase {
  id: number;
  purchaseReference: string;
  description: string;
  unitPrice: string;
  weight: string;
  status: string;
  expectedDeliveryDate: string;
  totalPaid: string;
  totalDelivered: string;
  supplierId: number;
  productId: number;
  blockerId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  supplier_id: number;
  product_id: number;
  blocker_id: number;
}

export interface Delivery {
  id: number;
  deliveryReference: string;
  status: string;
  weight: number;
  purchaseId: number;
  driverId: number;
  deliveredAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  purchase: Purchase;
  driver: Driver;
}

export interface CreateDeliveryDTO {
  status: string;
  weight: number;
  purchaseId: number;
  driverId: number;
  deliveredAt: string;
  notes: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeliveryResponse {
  success: boolean;
  data: Delivery[];
  pagination: PaginationInfo;
}

class DeliveryService {
  private baseUrl = 'https://test.gvibyequ.a2hosted.com/api';

  async getAllDeliveries(page = 1, pageSize = 10): Promise<DeliveryResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/deliveries?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            deliveryReference: 'DEL-001',
            status: 'completed',
            deliveredAt: '2024-03-15T10:00:00Z',
            notes: 'Sample delivery',
            weight: 1000,
            purchaseId: 1,
            driverId: 1,
            createdAt: '2024-03-14T10:00:00Z',
            updatedAt: '2024-03-14T10:00:00Z',
            deletedAt: null,
            purchase: {
              id: 1,
              purchaseReference: 'PUR-001',
              description: 'Sample purchase',
              unitPrice: '5000',
              weight: '1000',
              status: 'completed',
              expectedDeliveryDate: '2024-03-15T10:00:00Z',
              totalPaid: '5000',
              totalDelivered: '1000',
              supplierId: 1,
              productId: 1,
              blockerId: 1,
              supplier_id: 1,
              product_id: 1,
              blocker_id: 1,
              createdAt: '2024-03-14T10:00:00Z',
              updatedAt: '2024-03-14T10:00:00Z',
              deletedAt: null
            },
            driver: {
              id: 1,
              driverId: 'DRV-001',
              licenseNumber: 'LIC-001',
              userId: 1,
              user_id: 1,
              createdAt: '2024-03-01T10:00:00Z',
              updatedAt: '2024-03-01T10:00:00Z',
              deletedAt: null,
              user: {
                id: 1,
                username: 'driver1',
                email: 'driver1@example.com',
                passwordHash: 'passwordHash',
                accountStatus: 'active',
                isDefaultPassword: true,
                lastLogin: null,
                createdAt: '2024-03-01T10:00:00Z',
                updatedAt: '2024-03-01T10:00:00Z',
                deletedAt: null,
                profile: {
                  id: 1,
                  names: 'John Driver',
                  phoneNumber: '+1234567890',
                  address: '123 Main St, Anytown, USA',
                  status: 'active',
                  userId: 1,
                  user_id: 1,
                  createdAt: '2024-03-01T10:00:00Z',
                  updatedAt: '2024-03-01T10:00:00Z',
                  deletedAt: null
                }
              }
            }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };
    }
  }

  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const response = await axios.get(`${this.baseUrl}/deliveries/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching delivery:', error);
      throw error;
    }
  }

  async createDelivery(data: CreateDeliveryDTO): Promise<Delivery> {
    try {
      const response = await axios.post<Delivery>(`${this.baseUrl}/deliveries`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async updateDelivery(id: number, data: CreateDeliveryDTO): Promise<Delivery> {
    try {
      const response = await axios.put<Delivery>(`${this.baseUrl}/deliveries/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  }

  async deleteDelivery(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/deliveries/${id}`);
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  }
}

export const deliveryService = new DeliveryService(); 