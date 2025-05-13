export interface SaleItem {
  id?: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalDelivered?: string;
  note?: string;
  product?: {
    id: number;
    name: string;
    type?: string;
  };
}

export interface Sale {
  id: number;
  saleReference: string | null;
  quantity: string;
  unitPrice: string;
  status: string;
  expectedDeliveryDate: string;
  totalPaid: string;
  totalDelivered: string;
  note: string;
  createdAt: string;
  product: {
    id: number;
    name: string;
    type: string;
  };
  saler: {
    id: number;
    user: {
      profile: {
        names: string;
      };
    };
  };
  client: {
    id: number;
    clientId: string;
  } | null;
}
export interface Product {
  id: number;
  name: string;
}

export interface FormItem {
  id?: number;
  productId: string;
  quantity: string;
  unitPrice: string;
  note: string;
}

export interface Saler {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface Blocker {
  id: number;
  name: string;
}

export interface SortConfig {
  key: string;
  direction: "ascending" | "descending";
}
