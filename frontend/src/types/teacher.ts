export interface Teacher {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  specialization?: string;
  qualification?: string;
  experience?: number;
  salary?: number;
  joinDate?: string | Date;
  status?: "active" | "inactive" | "on_leave" | "";
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherQuery {
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