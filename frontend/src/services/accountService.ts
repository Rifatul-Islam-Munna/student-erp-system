import { fetchApi } from "@/lib/api";
import { Account, AccountQuery } from "@/types/account";

export const AccountService = {
  getAccounts: async (query: AccountQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/accounting?${params.toString()}`);
  },

  getAccountById: async (id: string) => {
    return fetchApi(`/accounting/${id}`);
  },

  createAccount: async (data: Partial<Account>) => {
    return fetchApi("/accounting", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAccount: async (id: string, data: Partial<Account>) => {
    return fetchApi(`/accounting/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteAccount: async (id: string) => {
    return fetchApi(`/accounting/${id}`, {
      method: "DELETE",
    });
  },

  exportAccounts: async (query: AccountQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/accounting/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export accounts");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importAccounts: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/accounting/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import accounts");
    }
    
    return response.json();
  }
};