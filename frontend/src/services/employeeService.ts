import { fetchApi } from "@/lib/api";
import { EmployeeProfile, EmployeeQuery, AttendanceQuery, PayrollQuery, Attendance, Payroll } from "@/types/employee";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const EmployeeService = {
  getEmployees: async (query: EmployeeQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/hr/employees?${params.toString()}`);
  },

  getEmployeeById: async (id: string) => {
    return fetchApi(`/hr/employees/${id}`);
  },

  createEmployee: async (data: Partial<EmployeeProfile>) => {
    return fetchApi("/hr/employees", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateEmployee: async (id: string, data: Partial<EmployeeProfile>) => {
    return fetchApi(`/hr/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteEmployee: async (id: string) => {
    return fetchApi(`/hr/employees/${id}`, {
      method: "DELETE",
    });
  },

  getDepartments: async () => {
    return fetchApi("/hr/employees/departments");
  },

  exportEmployees: async (query: EmployeeQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/hr/employees/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export employees");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importEmployees: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${API_URL}/hr/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import employees");
    }

    return response.json();
  },

  getAttendance: async (query: AttendanceQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/hr/attendance?${params.toString()}`);
  },

  markAttendance: async (data: Partial<Attendance>) => {
    return fetchApi("/hr/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAttendance: async (id: string, data: Partial<Attendance>) => {
    return fetchApi(`/hr/attendance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getPayroll: async (query: PayrollQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/hr/payroll?${params.toString()}`);
  },

  createPayroll: async (data: Partial<Payroll>) => {
    return fetchApi("/hr/payroll", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePayroll: async (id: string, data: Partial<Payroll>) => {
    return fetchApi(`/hr/payroll/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  processPayroll: async (employeeId: string, month: string, year: number) => {
    return fetchApi(`/hr/payroll/process`, {
      method: "POST",
      body: JSON.stringify({ employeeId, month, year }),
    });
  },
};