import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

export interface Delivery {
  id: number;
  deliveryReference: string;
  status: "pending" | "completed" | "cancelled" | "in_transit";
  deliveredAt: string;
  notes: string | null;
  weight: string;
  purchaseId: number;
  driverId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  purchase?: {
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
    blockerId: number | null;
  };
  driver?: {
    id: number;
    driverId: string;
    licenseNumber: string;
    user?: {
      id: number;
      username: string;
      email: string;
      profile?: {
        id: number;
        names: string;
        phoneNumber: string;
        address: string;
        status: string;
      };
    };
  };
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDeliveryData {
  purchaseId: number;
  driverId: number;
  weight: number;
  notes?: string;
  warehouseId?: number;
  status: "pending" | "completed" | "cancelled" | "in_transit";
  deliveredAt?: string;
}

interface UpdateDeliveryData {
  status?: "pending" | "completed" | "cancelled" | "in_transit";
  notes?: string;
  weight?: number;
  warehouseId?: number;
}

export interface DeliveryFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  includeDeleted?: boolean;
  driverId?: number;
  purchaseId?: number;
}

interface DeliveryResponse {
  success: boolean;
  data: Delivery[];
  pagination: PaginationInfo ;
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
      return response.data.data;
    } catch (error) {
      console.error("Error creating delivery:", error);
      throw error;
    }
  },

  getAllDeliveries: async (
    options: DeliveryFilterOptions = {}
  ): Promise<DeliveryResponse> => {
    try {
      const params = {
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        includeDeleted: options.includeDeleted ? "true" : "false",
        search: options.search,
        status: options.status,
        driverId: options.driverId,
        purchaseId: options.purchaseId,
      };

      const response = await axios.get(`${API_BASE_URL}/deliveries`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
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
      return response.data.data;
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
      return response.data.data;
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

  getDeliveryStatusOptions: () => {
    return [
      { value: "pending", label: "Pending" },
      { value: "in_transit", label: "In Transit" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ];
  },
};
