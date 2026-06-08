export interface Notification {
  _id?: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  isRead?: boolean;
  actionUrl?: string;
  user?: string;
  createdAt?: string;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  search?: string;
  isRead?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  inApp?: boolean;
  types?: string[];
}