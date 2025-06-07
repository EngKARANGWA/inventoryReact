// types.ts
export interface DeliveryFilters {
    page: number;
    pageSize: number;
    status: "completed" | "pending" | "delivered" | "cancelled" | undefined;
    direction: "in" | "out" | undefined;
    productId: number | undefined;
    warehouseId: number | undefined;
    driverId: number | undefined;
    dateFrom: string;
    dateTo: string;
    search?: string;
  }