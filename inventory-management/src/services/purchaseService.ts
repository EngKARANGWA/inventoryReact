import api from './authService';

export interface User {
  id: number;
  username: string;
  email: string;
  profile: {
    id: number;
    names: string;
    phoneNumber: string;
    address: string;
    status: string;
  };
}


export interface Product {
  id: number;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Payment {
  id: number;
  paymentReference: string;
  amount: string;
  payableType?: string;
  paymentMethod: string;
  status: string;
  transactionReference?: string | null;
  paidAt: string | null;
  purchaseId?: number;
  saleId?: null | number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: null | string;
  purchase_id?: number;
  sale_id?: null | number;
}

export interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  user_id: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile: {
      id: number;
      names: string;
      phoneNumber: string;
      address: string;
      status: string;
    };
  };
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  managerId: null | number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
}

export interface Delivery {
  id: number;
  deliveryReference: string;
  status: string;
  direction: string;
  deliveredAt: string;
  notes: string;
  quantity: string;
  unitPrice: null | string;
  purchaseId: number;
  saleId: null | number;
  driverId: number;
  productId: number;
  warehouseId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  warehouse_id: number;
  purchase_id: number;
  sale_id: null | number;
  driver_id: number;
  product_id: number;
  driver: Driver;
  warehouse: Warehouse;
  product: Product;
  weight?: string;
}

export interface Purchase {
  id: number;
  purchaseReference: string;
  description: string | null;
  unitPrice: string | null;
  weight: string;
  status:
    | "draft"
    | "approved"
    | "payment_completed"
    | "delivery_complete"
    | "all_completed";
  expectedDeliveryDate: string | null;
  totalPaid: string;
  totalDelivered: string;
  userId: number;
  productId: number;
  blockerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user_id?: number;
  product_id?: number;
  blocker_id?: number | null;
  user: User;
  product?: Product;
  payments: Payment[];
  deliveries: Delivery[];
  blocker?: {
    id: number;
    blockerId: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

interface CreatePurchaseData {
  userId: number;
  productId: number;
  weight: number;
  unitPrice: number;
  description?: string;
  expectedDeliveryDate?: string;
}

interface UpdatePurchaseData {
  description?: string;
  status?:
    | "draft"
    | "approved"
    | "payment_completed"
    | "delivery_complete"
    | "all_completed";
  expectedDeliveryDate?: string;
  weight?: number;
}

export interface PurchaseFilterOptions {
  page: number;
  pageSize: number;
  status: string;
  includeDeleted: boolean;
  userId?: number;
  productId?: number;
  search?: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const purchaseService = {
  async getAllSupplierUsers(): Promise<User[]> {
  try {
    const response = await api.get('/supplier');
    return response.data;
  } catch (error) {
    const err = error as ApiError;
    console.error("Error fetching supplier users:", err);
    return [];
  }
}
,

  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products');

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      }

      console.error("Unexpected API response format:", response.data);
      return [];
    } catch (error) {
      const err = error as ApiError;
      console.error("Error fetching products:", err);
      return [];
    }
  },

  async createPurchase(purchaseData: CreatePurchaseData): Promise<Purchase> {
    try {
      const response = await api.post('/purchases', purchaseData);

      if (response.data && response.data.success && response.data.data) {
        try {
          const completePurchase = await api.get(`/purchases/${response.data.data.id}`);
          return completePurchase.data.data;
        } catch (fetchError) {
          const err = fetchError as ApiError;
          console.error("Error fetching complete purchase:", err);
          return response.data.data;
        }
      }
      throw new Error("Unexpected API response format");
    } catch (error) {
      const err = error as ApiError;
      console.error("Error creating purchase:", err);
      if (err.response) {
        throw new Error(
          err.response?.data?.message ||
          err.message ||
          "Failed to create purchase"
        );
      }
      throw err;
    }
  },

  async getAllPurchases(options: Partial<PurchaseFilterOptions> = {}): Promise<Purchase[]> {
    try {
      const completeOptions: PurchaseFilterOptions = {
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        status: options.status || "",
        includeDeleted: options.includeDeleted || false,
        userId: options.userId,
        productId: options.productId,
        search: options.search,
      };

      const params = {
        page: completeOptions.page,
        pageSize: completeOptions.pageSize,
        includeDeleted: completeOptions.includeDeleted ? "true" : "false",
        search: completeOptions.search,
        status: completeOptions.status,
        productId: completeOptions.productId,
        userId: completeOptions.userId,
      };

      const response = await api.get('/purchases', { params });

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        return [];
      }
    } catch (error) {
      const err = error as ApiError;
      console.error("Error fetching purchases:", err);
      return [];
    }
  },

  async getPurchaseById(id: number, includeDeleted: boolean = false): Promise<Purchase | null> {
    try {
      const response = await api.get(`/purchases/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });

      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === "object") {
        return response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        return null;
      }
    } catch (error) {
      const err = error as ApiError;
      console.error("Error fetching purchase:", err);
      return null;
    }
  },

  async updatePurchase(id: number, purchaseData: UpdatePurchaseData): Promise<Purchase> {
    try {
      const response = await api.put(`/purchases/${id}`, purchaseData);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error("Unexpected API response format");
    } catch (error) {
      const err = error as ApiError;
      console.error("Error updating purchase:", err);
      if (err.response) {
        throw new Error(
          err.response?.data?.message || 
          err.message || 
          "Failed to update purchase"
        );
      }
      throw err;
    }
  },

  async deletePurchase(id: number): Promise<boolean> {
    try {
      await api.delete(`/purchases/${id}`);
      return true;
    } catch (error) {
      const err = error as ApiError;
      console.error("Error deleting purchase:", err);
      return false;
    }
  },

  async restorePurchase(id: number): Promise<Purchase> {
    try {
      const response = await api.post(`/purchases/${id}/restore`);
      return response.data;
    } catch (error) {
      const err = error as ApiError;
      console.error("Error restoring purchase:", err);
      throw err;
    }
  },

  async getDeletedPurchases(): Promise<Purchase[]> {
    try {
      const response = await api.get('/purchases/deleted');
      return response.data;
    } catch (error) {
      const err = error as ApiError;
      console.error("Error fetching deleted purchases:", err);
      return [];
    }
  },
};