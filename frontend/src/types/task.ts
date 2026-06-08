export interface Task {
  _id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string | Date;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  relatedStudent?: string;
  relatedVisitor?: string;
  relatedBatch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}