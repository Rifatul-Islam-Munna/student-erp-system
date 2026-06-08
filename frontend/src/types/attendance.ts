export interface Attendance {
  _id?: string;
  student?: any;
  batch?: any;
  date: string | Date;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  search?: string;
  batch?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}