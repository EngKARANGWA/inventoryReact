import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Supplier {
  id: number;
  supplierId: string;
  district: string;
  sector: string;
  cell: string;
  tinNumber: string;
  userId: number;
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
  supplierId: number;
  productId: number;
  blockerId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  supplier_id?: number;
  product_id?: number;
  blocker_id?: number | null;
  supplier: Supplier;
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
  supplierId: number;
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
  supplierId?: number;
  productId?: number;
  search?: string;
}

export const purchaseService = {
  getAllSuppliers: async (): Promise<Supplier[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/supplier`);
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return [];
    }
  },

  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);

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
      console.error("Error fetching products:", error);
      // toast.error("Failed to load products");
      return [];
    }
  },

  createPurchase: async (
    purchaseData: CreatePurchaseData
  ): Promise<Purchase> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/purchases`,
        purchaseData
      );

      if (response.data && response.data.success && response.data.data) {
        try {
          const completePurchase = await axios.get(
            `${API_BASE_URL}/purchases/${response.data.data.id}`
          );
          return completePurchase.data.data;
        } catch (fetchError) {
          console.error("Error fetching complete purchase:", fetchError);
          return response.data.data;
        }
      }
      throw new Error("Unexpected API response format");
    } catch (error) {
      console.error("Error creating purchase:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            error.message ||
            "Failed to create purchase"
        );
      }
      throw error;
    }
  },

  getAllPurchases: async (
    options: Partial<PurchaseFilterOptions> = {}
  ): Promise<Purchase[]> => {
    try {
      const completeOptions: PurchaseFilterOptions = {
        page: options.page || 1,
        pageSize: options.pageSize || 10,
        status: options.status || "",
        includeDeleted: options.includeDeleted || false,
        supplierId: options.supplierId,
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
        supplierId: completeOptions.supplierId,
      };

      const response = await axios.get(`${API_BASE_URL}/purchases`, { params });

      // Check if response.data has the expected structure based on API examples
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        // Return the data array from the response
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // If response.data is already an array, return it directly
        return response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  },

  getPurchaseById: async (
    id: number,
    includeDeleted: boolean = false
  ): Promise<Purchase | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });

      // Check if response.data has the expected structure (with success and data fields)
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && typeof response.data === "object") {
        // If direct object is returned
        return response.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
      return null;
    }
  },

  updatePurchase: async (
    id: number,
    purchaseData: UpdatePurchaseData
  ): Promise<Purchase> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/purchases/${id}`,
        purchaseData
      );
      
      // Handle nested response structure
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error("Unexpected API response format");
    } catch (error) {
      console.error("Error updating purchase:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 
          error.message || 
          "Failed to update purchase"
        );
      }
      throw error;
    }
  },

  deletePurchase: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/purchases/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting purchase:", error);
      return false;
    }
  },

  restorePurchase: async (id: number): Promise<Purchase> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/purchases/${id}/restore`
      );
      return response.data;
    } catch (error) {
      console.error("Error restoring purchase:", error);
      throw error;
    }
  },

  getDeletedPurchases: async (): Promise<Purchase[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases/deleted`);
      return response.data;
    } catch (error) {
      console.error("Error fetching deleted purchases:", error);
      return [];
    }
  },
};
