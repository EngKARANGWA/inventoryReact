import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  saleItem?: SaleItem | null; // Updated to use the SaleItem interface
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
  createDelivery: async (
    deliveryData: CreateDeliveryData
  ): Promise<Delivery> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/deliveries`,
        deliveryData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating delivery:", error);
      throw error;
    }
  },

  getAllDeliveries: async (
  ): Promise<DeliveryResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries`);
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

  getDeliveryById: async (
    id: number,
    includeDeleted: boolean = false
  ): Promise<Delivery | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/deliveries/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery:", error);
      return null;
    }
  },

  updateDelivery: async (
    id: number,
    deliveryData: UpdateDeliveryData
  ): Promise<Delivery> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/deliveries/${id}`,
        deliveryData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating delivery:", error);
      throw error;
    }
  },

  deleteDelivery: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/deliveries/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting delivery:", error);
      return false;
    }
  },

  restoreDelivery: async (id: number): Promise<boolean> => {
    try {
      await axios.post(`${API_BASE_URL}/deliveries/${id}/restore`);
      return true;
    } catch (error) {
      console.error("Error restoring delivery:", error);
      return false;
    }
  },
};