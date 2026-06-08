export interface AuditLog {
  _id?: string;
  action: string;
  entityType: string;
  entityId?: string;
  user?: {
    _id?: string;
    fullName: string;
    email: string;
  };
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface AuditLogStats {
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  byDate: Record<string, number>;
}