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
  totalAmount: string;
  status: string;
  expectedDeliveryDate: string;
  totalPaid: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  salerId: number;
  clientId: number | null;
  blockerId: number | null;
  items: Array<{
    id: number;
    productId: number;
    quantity: string;
    unitPrice: string;
    totalDelivered: string;
    note: string;
    product?: {
      id: number;
      name: string;
      type?: string;
    };
  }>;
  saler: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
    };
  };
  client: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
    };
  } | null;
  blocker?: {
    id: number;
    username: string;
    profile?: {
      names: string;
    };
  };
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
