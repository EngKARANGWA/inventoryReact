// src/types/purchase.ts

// Profile Interface
export interface Profile {
    id: number;
    names: string;
    phoneNumber: string;
    address: string;
    status: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    user_id: number;
  }
  
  // User Interface
  export interface User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    accountStatus: string;
    isDefaultPassword: boolean;
    lastLogin: null | string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    profile: Profile;
  }
  
  // Supplier Interface
  export interface Supplier {
    id: number;
    supplierId: string;
    district: string;
    sector: string;
    cell: string;
    tinNumber: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    user_id: number;
    user: User;
  }
  
  // Product Interface
  export interface Product {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
  }
  
  // Warehouse Interface
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
    deletedAt: null;
  }
  
  // Driver Interface
  export interface Driver {
    id: number;
    driverId: string;
    licenseNumber: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    user_id: number;
    user: User;
  }
  
  // Payment Interface
  export interface Payment {
    id: number;
    paymentReference: string;
    amount: string;
    payableType: string;
    paymentMethod: string;
    status: string;
    transactionReference: null | string;
    paidAt: null | string;
    purchaseId: number;
    saleId: null | number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    purchase_id: number;
    sale_id: null | number;
  }
  
  // Delivery Interface
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
    deletedAt: null;
    warehouse_id: number;
    purchase_id: number;
    sale_id: null | number;
    driver_id: number;
    product_id: number;
    driver: Driver;
    warehouse: Warehouse;
    product: Product;
  }
  
  // Main Purchase Interface
  export interface Purchase {
    id: number;
    purchaseReference: string;
    description: string;
    unitPrice: string | null;
    weight: string;
    status: 'draft' | 'approved' | 'payment_completed' | 'delivery_complete' | 'all_completed';
    expectedDeliveryDate: string;
    totalPaid: string;
    totalDelivered: string;
    supplierId: number;
    productId: number;
    blockerId: null | number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    supplier_id: number;
    product_id: number;
    blocker_id: null | number;
    supplier: Supplier;
    product: Product;
    blocker: null;
    payments?: Payment[];
    deliveries?: Delivery[];
  }
  
  // API Response Interfaces
  export interface PurchasesResponse {
    success: boolean;
    count: number;
    data: Purchase[];
  }
  
  export interface SinglePurchaseResponse {
    success: boolean;
    data: Purchase;
  }
  
  // Filter Options Interface
  export interface PurchaseFilterOptions {
    page?: number;
    pageSize?: number;
    status?: string;
    includeDeleted?: boolean;
    supplierId?: number;
    productId?: number;
    search?: string;
  }