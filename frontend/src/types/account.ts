export type AccountType = "asset" | "liability" | "equity" | "income" | "expense";

export type AccountStatus = "active" | "inactive";

export interface Account {
  _id?: string;
  name: string;
  code: string;
  type: AccountType;
  balance: number;
  parentAccount?: string | null;
  description?: string;
  status: AccountStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: AccountType;
  status?: AccountStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}