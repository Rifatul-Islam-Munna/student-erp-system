import { fetchApi } from "@/lib/api";
import { PartnerAgency, PartnerAgencyQuery } from "@/types/partnerAgency";

export const PartnerAgencyService = {
  getPartnerAgencies: async (query: PartnerAgencyQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/partner-agencies?${params.toString()}`);
  },

  getPartnerAgencyById: async (id: string) => {
    return fetchApi(`/partner-agencies/${id}`);
  },

  createPartnerAgency: async (data: Partial<PartnerAgency>) => {
    return fetchApi("/partner-agencies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePartnerAgency: async (id: string, data: Partial<PartnerAgency>) => {
    return fetchApi(`/partner-agencies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePartnerAgency: async (id: string) => {
    return fetchApi(`/partner-agencies/${id}`, {
      method: "DELETE",
    });
  },

  exportPartnerAgencies: async (query: PartnerAgencyQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/partner-agencies/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export partner agencies");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner-agencies_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importPartnerAgencies: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/partner-agencies/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import partner agencies");
    }
    
    return response.json();
  }
};