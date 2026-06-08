import { fetchApi } from "@/lib/api";
import { Teacher, TeacherQuery } from "@/types/teacher";

export const TeacherService = {
  getTeachers: async (query: TeacherQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/teachers?${params.toString()}`);
  },

  getTeacherById: async (id: string) => {
    return fetchApi(`/teachers/${id}`);
  },

  createTeacher: async (data: Partial<Teacher>) => {
    return fetchApi("/teachers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTeacher: async (id: string, data: Partial<Teacher>) => {
    return fetchApi(`/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTeacher: async (id: string) => {
    return fetchApi(`/teachers/${id}`, {
      method: "DELETE",
    });
  },

  exportTeachers: async (query: TeacherQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/teachers/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export teachers");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teachers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importTeachers: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/teachers/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import teachers");
    }
    
    return response.json();
  }
};