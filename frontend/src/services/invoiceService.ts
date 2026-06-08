import { fetchApi } from "@/lib/api";
import { Invoice, InvoiceQuery, InvoiceStats } from "@/types/invoice";

export const InvoiceService = {
  getInvoices: async (query: InvoiceQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/invoices?${params.toString()}`);
  },

  getInvoiceById: async (id: string) => {
    return fetchApi(`/invoices/${id}`);
  },

  createInvoice: async (data: Partial<Invoice>) => {
    return fetchApi("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    return fetchApi(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteInvoice: async (id: string) => {
    return fetchApi(`/invoices/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return fetchApi("/invoices/stats");
  },

  exportInvoices: async (query: InvoiceQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/invoices/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export invoices");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importInvoices: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/invoices/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import invoices");
    }
    
    return response.json();
  }
};