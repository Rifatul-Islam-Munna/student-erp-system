import { fetchApi } from "@/lib/api";
import { FAQ, FAQQuery } from "@/types/faq";

export const FAQService = {
  getFAQs: async (query: FAQQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/faqs?${params.toString()}`);
  },

  getFAQById: async (id: string) => {
    return fetchApi(`/faqs/${id}`);
  },

  createFAQ: async (data: Partial<FAQ>) => {
    return fetchApi("/faqs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateFAQ: async (id: string, data: Partial<FAQ>) => {
    return fetchApi(`/faqs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteFAQ: async (id: string) => {
    return fetchApi(`/faqs/${id}`, {
      method: "DELETE",
    });
  },

  exportFAQs: async (query: FAQQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/faqs/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export FAQs");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faqs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importFAQs: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/faqs/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import FAQs");
    }
    
    return response.json();
  }
};