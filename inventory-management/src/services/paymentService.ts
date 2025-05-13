import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Payment {
  id: number;
  paymentReference: string;
  amount: number;
  payableType: "purchase" | "sale";
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionReference: string | null;
  paidAt: string | null;
  purchaseId: number | null;
  saleId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  purchase?: {
    id: number;
    purchaseReference: string;
    description: string;
    supplier?: {
      id: number;
      supplierId: string;
      user?: {
        profile?: {
          names: string;
        };
      };
    };
  };
  sale?: {
    id: number;
    saleReference: string;
    totalAmount: number;
    totalPaid: number;
    status: string;
    client?: {
      id: number;
      user?: {
        profile?: {
          names: string;
        };
      };
    };
    items?: SaleItem[];
  };
}

export interface Purchase {
  id: number;
  purchaseReference: string;
  description: string;
  weight: number;
  status: string;
  totalPaid: number;
  supplier?: {
    id: number;
    user?: {
      profile?: {
        names: string;
      };
    };
  };
}

export interface Sale {
  id: number;
  saleReference: string;
  totalAmount: number;
  totalPaid: number;
  status: string;
  client?: {
    id: number;
    user?: {
      profile?: {
        names: string;
      };
    };
  };
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: number;
    name: string;
  };
}

interface CreatePaymentData {
  amount: number;
  payableType: "purchase" | "sale";
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  transactionReference?: string;
  purchaseId?: number;
  saleId?: number;
}

interface UpdatePaymentData {
  amount?: number;
  paymentMethod?: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  transactionReference?: string;
}

interface PaymentResponse {
  success: boolean;
  data: Payment[];
  pagination: {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
}

export const paymentService = {
  createPayment: async (
    paymentData: CreatePaymentData,
    file?: File
  ): Promise<Payment> => {
    const formData = new FormData();

    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (file) {
      formData.append("transactionReference", file);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/payments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  },

  getAllPayments: async (): Promise<PaymentResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      return {
        success: false,
        data: [],
        pagination: {
          totalItems: 0,
          currentPage: 1,
          pageSize: 10,
          totalPages: 1,
        },
      };
    }
  },

  getPaymentById: async (
    id: number,
    includeDeleted: boolean = false
  ): Promise<Payment | null> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${id}`, {
        params: { includeDeleted: includeDeleted ? "true" : "false" },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching payment:", error);
      return null;
    }
  },

  updatePayment: async (
    id: number,
    paymentData: UpdatePaymentData,
    file?: File
  ): Promise<Payment> => {
    const formData = new FormData();

    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (file) {
      formData.append("transactionReference", file);
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/payments/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  },

  deletePayment: async (id: number): Promise<boolean> => {
    try {
      await axios.delete(`${API_BASE_URL}/payments/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      return false;
    }
  },

  restorePayment: async (id: number): Promise<boolean> => {
    try {
      await axios.put(`${API_BASE_URL}/payments/${id}/restore`);
      return true;
    } catch (error) {
      console.error("Error restoring payment:", error);
      return false;
    }
  },

  getPurchases: async (search: string = ""): Promise<Purchase[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases`, {
        params: { search },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  },

  getSales: async (search: string = ""): Promise<Sale[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        params: { search },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching sales:", error);
      return [];
    }
  },

  getSalesWithItems: async (search: string = ""): Promise<Sale[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        params: { 
          search,
          includeItems: "true" 
        },
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching sales with items:", error);
      return [];
    }
  },

  getPaymentFile: async (filename: string): Promise<Blob> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/file/${filename}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payment file:", error);
      throw new Error("Failed to load payment file");
    }
  },
};