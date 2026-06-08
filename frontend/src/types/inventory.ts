export interface InventoryItem {
  _id?: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  reorderLevel?: number;
  status?: "active" | "inactive" | "discontinued";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryLog {
  _id?: string;
  itemId: string;
  action: "created" | "updated" | "deleted" | "stock_in" | "stock_out" | "reorder";
  quantity?: number;
  previousQuantity?: number;
  notes?: string;
  performedBy?: string;
  createdAt?: string;
}

export interface InventoryItemQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface InventoryLogQuery {
  page?: number;
  limit?: number;
  itemId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}