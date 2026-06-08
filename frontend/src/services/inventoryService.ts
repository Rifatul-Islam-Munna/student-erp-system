import { fetchApi } from "@/lib/api";
import { InventoryItem, InventoryItemQuery, InventoryLog, InventoryLogQuery } from "@/types/inventory";

export const InventoryService = {
  getItems: async (query: InventoryItemQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/inventory/items?${params.toString()}`);
  },

  getItemById: async (id: string) => {
    return fetchApi(`/inventory/items/${id}`);
  },

  createItem: async (data: Partial<InventoryItem>) => {
    return fetchApi("/inventory/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateItem: async (id: string, data: Partial<InventoryItem>) => {
    return fetchApi(`/inventory/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteItem: async (id: string) => {
    return fetchApi(`/inventory/items/${id}`, {
      method: "DELETE",
    });
  },

  getLogs: async (query: InventoryLogQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/inventory/logs?${params.toString()}`);
  },

  exportItems: async (query: InventoryItemQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/inventory/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export inventory items");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importItems: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/inventory/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import inventory items");
    }
    
    return response.json();
  },

  getCategories: async () => {
    return fetchApi("/inventory/categories");
  },
};