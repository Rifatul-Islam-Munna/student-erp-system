import { fetchApi } from "@/lib/api";
import { SchoolSubmission, SchoolSubmissionQuery } from "@/types/schoolSubmission";

export const SchoolSubmissionService = {
  getSchoolSubmissions: async (query: SchoolSubmissionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/school-submissions?${params.toString()}`);
  },

  getSchoolSubmissionById: async (id: string) => {
    return fetchApi(`/school-submissions/${id}`);
  },

  createSchoolSubmission: async (data: Partial<SchoolSubmission>) => {
    return fetchApi("/school-submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateSchoolSubmission: async (id: string, data: Partial<SchoolSubmission>) => {
    return fetchApi(`/school-submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteSchoolSubmission: async (id: string) => {
    return fetchApi(`/school-submissions/${id}`, {
      method: "DELETE",
    });
  },

  getPipeline: async () => {
    return fetchApi("/school-submissions/pipeline");
  },

  exportSchoolSubmissions: async (query: SchoolSubmissionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/school-submissions/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export school submissions");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school-submissions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importSchoolSubmissions: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/school-submissions/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import school submissions");
    }
    
    return response.json();
  }
};