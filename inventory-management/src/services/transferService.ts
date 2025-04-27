import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";


export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  managerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  manager: any | null;
  scaleMonitor: any | null;
}

export interface Transfer {
  id: number;
  referenceNumber: string;
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  date: string;
  quantity: number;
  note: string | null;
  driverId: number;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product?: {
    id: number;
    name: string;
    description: string;
  };
  fromWarehouse?: {
    id: number;
    name: string;
    location: string;
  };
  toWarehouse?: {
    id: number;
    name: string;
    location: string;
  };
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
}

interface CreateTransferData {
  productId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  driverId: number;
  quantity: number;
  note?: string;
}

interface UpdateTransferData {
  note?: string;
  status?: "pending" | "completed" | "cancelled";
}

export interface TransferFilterOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  includeDeleted?: boolean;
}

interface TransferResponse {
  success: boolean;
  data: Transfer[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const transferService = {
  createTransfer: async (
    transferData: CreateTransferData
  ): Promise<Transfer> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/transfers`,
        transferData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  },

  getAllTransfers: async (
    // options: TransferFilterOptions = {}
  ): Promise<TransferResponse> => {
    try {
      

      const response = await axios.get(`${API_BASE_URL}/transfers`);
      return response.data;
    } catch (error) {
      console.error("Error fetching transfers:", error);
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

  getTransferById: async (
    id: number,
    includeDeleted: boolean = false
  ): Promise<Transfer | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transfers/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching transfer:", error);
      return null;
    }
  },

  updateTransfer: async (
    id: number,
    transferData: UpdateTransferData
  ): Promise<Transfer> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/transfers/${id}`,
        transferData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating transfer:", error);
      throw error;
    }
  },

  deleteTransfer: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/transfers/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting transfer:", error);
      return false;
    }
  },
};
