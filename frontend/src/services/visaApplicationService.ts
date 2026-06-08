import { fetchApi } from "@/lib/api";
import { VisaApplication, VisaApplicationQuery } from "@/types/visaApplication";

export const VisaApplicationService = {
  getVisaApplications: async (query: VisaApplicationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/visa-applications?${params.toString()}`);
  },

  getVisaApplicationById: async (id: string) => {
    return fetchApi(`/visa-applications/${id}`);
  },

  createVisaApplication: async (data: Partial<VisaApplication>) => {
    return fetchApi("/visa-applications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateVisaApplication: async (id: string, data: Partial<VisaApplication>) => {
    return fetchApi(`/visa-applications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteVisaApplication: async (id: string) => {
    return fetchApi(`/visa-applications/${id}`, {
      method: "DELETE",
    });
  },

  getPipeline: async () => {
    return fetchApi("/visa-applications/pipeline");
  },

  exportVisaApplications: async (query: VisaApplicationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/visa-applications/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export visa applications");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visa_applications_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importVisaApplications: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/visa-applications/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import visa applications");
    }
    
    return response.json();
  }
};