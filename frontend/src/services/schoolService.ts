import { fetchApi } from "@/lib/api";
import { School, SchoolQuery } from "@/types/school";

export const SchoolService = {
  getSchools: async (query: SchoolQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/schools?${params.toString()}`);
  },

  getSchoolById: async (id: string) => {
    return fetchApi(`/schools/${id}`);
  },

  createSchool: async (data: Partial<School>) => {
    return fetchApi("/schools", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSchool: async (id: string, data: Partial<School>) => {
    return fetchApi(`/schools/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteSchool: async (id: string) => {
    return fetchApi(`/schools/${id}`, {
      method: "DELETE",
    });
  },

  exportSchools: async (query: SchoolQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/schools/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export schools");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schools_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importSchools: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/schools/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import schools");
    }
    
    return response.json();
  }
};
