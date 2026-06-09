export interface Permission {
  _id?: string;
  name: string;
  key?: string;
  description?: string;
  module?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}
