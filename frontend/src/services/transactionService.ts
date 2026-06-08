import { fetchApi } from "@/lib/api";
import { Transaction, TransactionQuery } from "@/types/transaction";

export const TransactionService = {
  getTransactions: async (query: TransactionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/accounts?${params.toString()}`);
  },

  getTransactionById: async (id: string) => {
    return fetchApi(`/accounts/${id}`);
  },

  createTransaction: async (data: Partial<Transaction>) => {
    return fetchApi("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    return fetchApi(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTransaction: async (id: string) => {
    return fetchApi(`/accounts/${id}`, {
      method: "DELETE",
    });
  },

  getStats: async () => {
    return fetchApi("/accounts/stats");
  },

  exportTransactions: async (query: TransactionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/accounts/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export transactions");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importTransactions: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/accounts/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import transactions");
    }
    
    return response.json();
  }
};