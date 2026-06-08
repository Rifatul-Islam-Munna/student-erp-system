import { User } from "./user";

export interface EmployeeProfile {
  _id?: string;
  user: User;
  employeeId?: string;
  department?: string;
  designation?: string;
  joinDate?: string | Date;
  salary?: number;
  status?: "active" | "inactive" | "terminated";
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  _id?: string;
  employeeId?: string;
  date?: string | Date;
  checkIn?: string | Date;
  checkOut?: string | Date;
  hoursWorked?: number;
  status?: "present" | "absent" | "late" | "half_day";
  notes?: string;
  createdAt?: string;
}

export interface Payroll {
  _id?: string;
  employeeId?: string;
  month?: string;
  year?: number;
  baseSalary?: number;
  allowances?: number;
  deductions?: number;
  bonus?: number;
  netSalary?: number;
  status?: "pending" | "paid" | "failed";
  paidAt?: string | Date;
  createdAt?: string;
}

export interface EmployeeQuery {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface AttendanceQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}

export interface PayrollQuery {
  page?: number;
  limit?: number;
  employeeId?: string;
  month?: string;
  year?: number;
  status?: string;
  [key: string]: any;
}