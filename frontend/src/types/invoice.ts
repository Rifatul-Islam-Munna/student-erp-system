export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  student: string | {
    _id: string;
    fullNameEn: string;
    email: string;
    phone: string;
  };
  amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled" | "draft";
  dueDate: string | Date;
  paidDate?: string | Date;
  items: InvoiceItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface InvoiceStats {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  paidThisMonth: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}