import api  from './authService';

// Keep all your existing interfaces
export interface SaleItem {
  id: number;
  quantity: string;
  unitPrice: string;
  totalDelivered: string;
  note?: string;
  saleId: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    type?: string;
    description?: string;
  };
  sale?: {
    id: number;
    saleReference: string;
    referenceNumber?: string;
    status?: string;
    client?: {
      name?: string;
    };
  };
}

export interface Delivery {
  id: number;
  deliveryReference: string;
  status: "completed" | "pending" | "delivered" | "cancelled";
  direction: "in" | "out";
  deliveredAt: string;
  notes: string | null;
  quantity: string;
  purchaseId: number | null;
  saleId: number | null;
  saleItemId: number | null; 
  driverId: number;
  unitPrice: string;
  productId: number | null;
  warehouseId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  driver?: {
    id: number;
    driverId: string;
    licenseNumber: string;
    user?: {
      profile?: {
        names: string;
      };
    };
  };
  product?: {
    id: number;
    name: string;
    type: string;
    description: string;
  } | null;
  warehouse?: {
    id: number;
    name: string;
    location: string;
    capacity?: number;
    currentOccupancy?: number;
  } | null;
  purchase?: {
    id: number;
    purchaseReference: string;
    description: string;
    weight?: string;
    status?: string;
    expectedDeliveryDate?: string;
    totalPaid?: string;
    totalDelivered?: string;
    supplier?: {
      id: number;
      supplierId: string;
      district?: string;
      sector?: string;
      cell?: string;
      tinNumber?: string;
    };
  } | null;
  sale?: {
    id: number;
    referenceNumber: string;
    saleReference?: string;
    note?: string;
    status?: string;
    client?: {
      name?: string;
    };
    items?: SaleItem[];
  } | null;
  saleItem?: SaleItem | null;
}

export interface CreateDeliveryData {
  direction: "in" | "out";
  quantity: number;
  driverId: number;
  warehouseId: number;
  saleId?: number;
  saleItemId?: number;
  purchaseId?: number;
  notes?: string;
}

interface UpdateDeliveryData {
  notes?: string;
  status?: "completed" | "pending" | "delivered" | "cancelled";
}

export interface DeliveryFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "completed" | "pending" | "delivered" | "cancelled";
  direction?: "in" | "out";
  productId?: number;
  warehouseId?: number;
  driverId?: number;
  dateFrom?: string;
  dateTo?: string;
  includeDeleted?: boolean;
}

export interface DeliveryResponse {
  total: number;
  page: number;
  pageSize: number;
  deliveries: Delivery[];
}

export const deliveryService = {
  async createDelivery(deliveryData: CreateDeliveryData): Promise<Delivery> {
    try {
      const response = await api.post('/deliveries', deliveryData);
      return response.data;
    } catch (error) {
      console.error("Error creating delivery:", error);
      throw error;
    }
  },

  async getAllDeliveries(filterOptions?: DeliveryFilterOptions): Promise<DeliveryResponse> {
    try {
      const response = await api.get('/deliveries', {
        params: filterOptions
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      return {
        total: 0,
        page: 1,
        pageSize: 10,
        deliveries: [],
      };
    }
  },

  async getDeliveryById(id: number, includeDeleted: boolean = false): Promise<Delivery | null> {
    try {
      const response = await api.get(`/deliveries/${id}`, {
        params: { includeDeleted }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery:", error);
      return null;
    }
  },

  async updateDelivery(id: number, deliveryData: UpdateDeliveryData): Promise<Delivery> {
    try {
      const response = await api.put(`/deliveries/${id}`, deliveryData);
      return response.data;
    } catch (error) {
      console.error("Error updating delivery:", error);
      throw error;
    }
  },

  async deleteDelivery(id: number): Promise<boolean> {
    try {
      await api.delete(`/deliveries/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting delivery:", error);
      return false;
    }
  },

  async restoreDelivery(id: number): Promise<boolean> {
    try {
      await api.post(`/deliveries/${id}/restore`);
      return true;
    } catch (error) {
      console.error("Error restoring delivery:", error);
      return false;
    }
  },
};