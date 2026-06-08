import { fetchApi } from "@/lib/api";
import { Student, StudentQuery } from "@/types/student";

export const StudentService = {
  getStudents: async (query: StudentQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/students?${params.toString()}`);
  },

  getStudentById: async (id: string) => {
    return fetchApi(`/students/${id}`);
  },

  createStudent: async (data: Partial<Student>) => {
    return fetchApi("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
    return fetchApi(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteStudent: async (id: string) => {
    return fetchApi(`/students/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return fetchApi("/students/stats");
  },

  exportStudents: async (query: StudentQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/students/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export students");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importStudents: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/students/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import students");
    }
    
    return response.json();
  }
};
