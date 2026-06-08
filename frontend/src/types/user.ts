export interface User {
  _id?: string;
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role: "super_admin" | "admin" | "counselor" | "agent" | "student" | "branch" | "teacher";
  avatar?: string | null;
  accountStatus?: "active" | "inactive" | "suspended";
  permissions?: string[];
  lastLoginAt?: string | Date | null;
  lastLoginIp?: string | null;
  branch?: any;
  school?: any;
  address?: string | null;
  commissionType?: "fixed" | "percentage" | "";
  commissionAmount?: number;
  totalEarnings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  accountStatus?: string;
  branch?: string;
  [key: string]: any;
}