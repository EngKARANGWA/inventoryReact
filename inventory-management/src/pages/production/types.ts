export interface ProductionCost {
  name?: string;
  description?: string;
  cost?: number;
  amount?: number;
  price?: number;
}

export interface Product {
  id: number;
  name: string;
  type: string;
  description?: string;
  unit?: string;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  profile?: {
    names?: string;
    phoneNumber?: string;
  };
}

export interface Warehouse {
  id: number;
  name: string;
  location?: string;
}

export interface Production {
  id: number;
  referenceNumber: string;
  productId: number;
  quantityProduced: number;
  unitPrice: number | null;
  mainProductId?: number | null;
  usedQuantity?: number | null;
  date: string;
  productionCost: ProductionCost[];
  userId: number;
  notes?: string;
  product?: Product;
  mainProduct?: Product | null;
  createdBy?: User;
  warehouseId?: number | null;
  warehouse?: Warehouse | null;
  createdAt?: string;
  updatedAt?: string;
}


export interface FilterParams {
  productId?: string;
  warehouseId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}