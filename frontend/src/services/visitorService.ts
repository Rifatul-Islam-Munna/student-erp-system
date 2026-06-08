import { fetchApi } from "@/lib/api";
import { Visitor, VisitorQuery } from "@/types/visitor";

export const VisitorService = {
  getVisitors: async (query: VisitorQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/visitors?${params.toString()}`);
  },

  getVisitorById: async (id: string) => {
    return fetchApi(`/visitors/${id}`);
  },

  createVisitor: async (data: Partial<Visitor>) => {
    return fetchApi("/visitors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateVisitor: async (id: string, data: Partial<Visitor>) => {
    return fetchApi(`/visitors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteVisitor: async (id: string) => {
    return fetchApi(`/visitors/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return fetchApi("/visitors/stats");
  },

  calculateScore: async (id: string) => {
    return fetchApi(`/visitors/${id}/calculate-score`, {
      method: "POST",
    });
  },

  scheduleFollowup: async (id: string, data: { date: string; note: string }) => {
    return fetchApi(`/visitors/${id}/schedule-followup`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  exportVisitors: async (query: VisitorQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/visitors/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export visitors");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importVisitors: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/visitors/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import visitors");
    }
    
    return response.json();
  }
};