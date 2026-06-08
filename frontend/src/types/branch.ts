export interface Branch {
  _id?: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  [key: string]: any;
}
