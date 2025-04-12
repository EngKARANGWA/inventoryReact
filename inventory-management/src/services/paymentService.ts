import axios from 'axios';

export interface Payment {
  id: number;
  status: string;
  payableType: string;
  purchaseId: number | null;
  saleId: number | null;
  amount: string;
  paymentMethod: string;
  paymentReference: string;
  transactionReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreatePaymentDTO {
  status: string;
  payableType: string;
  purchaseId?: number;
  saleId?: number;
  amount: string;
  paymentMethod: string;
  paymentReference: string;
  transactionReference?: string;
  paidAt?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment[];
  pagination: PaginationInfo;
}

class PaymentService {
  private baseUrl = 'https://test.gvibyequ.a2hosted.com/api';

  async getAllPayments(page = 1, pageSize = 10): Promise<PaymentResponse> {
    try {
      const response = await axios.get(`${this.baseUrl}/payments?page=${page}&pageSize=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Return mock data for development
      return {
        success: true,
        data: [
          {
            id: 1,
            status: "completed",
            payableType: "purchase",
            purchaseId: 1,
            amount: "100.00",
            paymentMethod: "mobile_money",
            paymentReference: "PYMT-11-04-2025-17-48-acme",
            updatedAt: "2025-04-11T21:48:13.881Z",
            createdAt: "2025-04-11T21:48:13.881Z",
            transactionReference: null,
            paidAt: null,
            saleId: null,
            deletedAt: null
          },
          {
            id: 2,
            status: "pending",
            payableType: "sale",
            purchaseId: null,
            amount: "250.00",
            paymentMethod: "bank_transfer",
            paymentReference: "PYMT-12-04-2025-10-30-acme",
            updatedAt: "2025-04-12T10:30:45.123Z",
            createdAt: "2025-04-12T10:30:45.123Z",
            transactionReference: "TRX-123456",
            paidAt: null,
            saleId: 1,
            deletedAt: null
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1
        }
      };
    }
  }

  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await axios.get(`${this.baseUrl}/payments/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    try {
      const response = await axios.post<Payment>(`${this.baseUrl}/payments`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async updatePayment(id: number, data: CreatePaymentDTO): Promise<Payment> {
    try {
      const response = await axios.put<Payment>(`${this.baseUrl}/payments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/payments/${id}`);
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService(); 