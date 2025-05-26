export interface ProductionCost {
  item?: string;
  name?: string;
  description?: string;
  cost?: number;
  amount?: number;
  price?: number;
  total?: number;
  quantity?: number;
  unitPrice?: number;
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
  capacity?: number;
  currentOccupancy?: number;
  status?: string;
  managerId?: number;
}

export interface StockMovement {
  id: number;
  referenceNumber: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  direction: 'in' | 'out';
  warehouseId: number;
  sourceType: string;
  productionId?: number;
  movementDate: string;
  userId: number;
  notes?: string;
  product?: Product;
  warehouse?: Warehouse;
  productionOutcome?: ProductionOutcome;
}

export interface ProductionOutcome {
  id?: number;
  productionId?: number;
  outcomeType: 'finished_product' | 'byproduct' | 'loss';
  name: string;
  quantity: number;
  unit: string;
  productId?: number;
  unitPrice?: number;
  warehouseId?: number;
  notes?: string;
  product?: Product;
  warehouse?: Warehouse;
  stockMovement?: StockMovement;
}

export interface PackageSummary {
  size?: string;        // Backend expects 'size'
  packageSize?: string; // Frontend uses 'packageSize'
  quantity: number;
  totalWeight: number;
  unit?: string;
}

export interface OutcomesSummary {
  finished: number;
  byproducts: number;
  loss: number;
}

export interface Production {
  id: number;
  referenceNumber: string;
  productId: number;
  quantityProduced: number;
  totalOutcome: number;    
  mainProductId?: number | null;
  usedQuantity?: number | null;
  mainProductUnitCost?: number | null;
  mainProductUnitPrice?: number | null;
  packagesSummary?: PackageSummary[];
  outcomesSummary?: OutcomesSummary;
  productionLoss?: number;
  efficiency?: number | null;
  date: string;
  productionCost: ProductionCost[];
  userId: number;
  notes?: string;
  product?: Product;
  mainProduct?: Product | null;
  createdBy?: User;
  warehouseId?: number | null;
  warehouse?: Warehouse | null;
  outcomes?: ProductionOutcome[];
  stockMovements?: StockMovement[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface FilterParams {
  productId?: string | number;
  mainProductId?: string | number;
  warehouseId?: string | number;
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  minEfficiency?: number;
  maxEfficiency?: number;
  minOutcome?: number;
  maxOutcome?: number;
  hasLoss?: boolean;
  hasByproduct?: boolean;
}