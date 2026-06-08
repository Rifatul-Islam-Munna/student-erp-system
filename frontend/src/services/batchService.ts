import { fetchApi } from "@/lib/api";
import { Batch, BatchQuery } from "@/types/batch";

export const BatchService = {
  getBatches: async (query: BatchQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/batches?${params.toString()}`);
  },

  getBatchById: async (id: string) => {
    return fetchApi(`/batches/${id}`);
  },

  createBatch: async (data: Partial<Batch>) => {
    return fetchApi("/batches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateBatch: async (id: string, data: Partial<Batch>) => {
    return fetchApi(`/batches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteBatch: async (id: string) => {
    return fetchApi(`/batches/${id}`, {
      method: "DELETE",
    });
  },

  exportBatches: async (query: BatchQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/batches/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export batches");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batches_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importBatches: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/batches/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import batches");
    }
    
    return response.json();
  }
};