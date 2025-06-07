import api  from './authService';

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
    type?: string; // Added this
  };
  fromWarehouse?: Warehouse;
  toWarehouse?: Warehouse;
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

export interface AveragePriceData {
  productId: number;
  warehouseId: number | null;
  averageUnitPrice: number;
  totalQuantity: number;
  currentStock: number;
  totalValue: number;
  countedQuantity: number;
  movements: number;
  movementsWithPrice: number;
  calculationDate: string;
}


export const stockMovementService = {
  getAveragePrice: async (productId: number): Promise<AveragePriceData> => {
    try {
      const response = await api.get(`/stoke-movements/average-price/${productId}`);
      return response.data.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch average price';
      console.error("Error fetching average price:", error);
      throw new Error(errorMessage);
    }
  },
};

export const transferService = {
    createTransfer: async (
      transferData: CreateTransferData
    ): Promise<Transfer> => {
      try {
        const response = await api.post('/transfers', transferData);
        return response.data.data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to create transfer';
        console.error("Error creating transfer:", error);
        throw new Error(errorMessage);
      }
    },

  getAllTransfers: async (
    options: TransferFilterOptions = {}
  ): Promise<TransferResponse> => {
    try {
      const params = {
        page: options.page,
        pageSize: options.pageSize,
        search: options.search,
        status: options.status,
        includeDeleted: options.includeDeleted ? "true" : "false"
      };

      const response = await api.get('/transfers', { params });
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
      const response = await api.get(`/transfers/${id}`, {
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
      const response = await api.put(`/transfers/${id}`, transferData);
      return response.data.data;
    } catch (error) {
      console.error("Error updating transfer:", error);
      throw error;
    }
  },

  deleteTransfer: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/transfers/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting transfer:", error);
      return false;
    }
  },
};