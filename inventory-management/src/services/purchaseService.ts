import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

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
  description: string;
}

export interface Payment {
  id: number;
  paymentReference: string;
  amount: string;
  payableType: string;
  paymentMethod: string;
  status: string;
  transactionReference: string | null;
  paidAt: string | null;
}

export interface Delivery {
  id: number;
  deliveryReference: string;
  status: string;
  deliveredAt: string;
  notes: string;
  weight: string;
  driverId: number;
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
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
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
      // Fetch the complete purchase after creation
      const completePurchase = await axios.get(
        `${API_BASE_URL}/purchases/${response.data.id}`
      );
      return completePurchase.data;
    } catch (error) {
      console.error("Error creating purchase:", error);
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

      const response = await axios.get<Purchase[]>(
        `${API_BASE_URL}/purchases`,
        { params }
      );
      return response.data;
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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error("Error updating purchase:", error);
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
