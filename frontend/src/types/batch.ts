export interface Batch {
  _id?: string;
  name: string;
  courseName?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  timing?: string;
  branch?: any;
  teacher?: any;
  status?: "active" | "completed" | "upcoming" | "cancelled";
  maxStudents?: number;
  enrolledStudents?: number;
  fees?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}