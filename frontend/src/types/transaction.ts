export type TransactionType = "debit" | "credit";

export interface Transaction {
  _id?: string;
  date: string | Date;
  account: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  relatedInvoice?: string | {
    _id: string;
    invoiceNumber: string;
  };
  relatedStudent?: string | {
    _id: string;
    fullNameEn: string;
    email: string;
    phone: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  account?: string;
  [key: string]: any;
}

export interface TransactionStats {
  totalDebits: number;
  totalCredits: number;
  balance: number;
  transactionCount: number;
}