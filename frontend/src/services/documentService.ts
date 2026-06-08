import { fetchApi } from "@/lib/api";
import { DocumentTemplate, DocumentQuery } from "@/types/document";

export const DocumentService = {
  getDocuments: async (query: DocumentQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/documents?${params.toString()}`);
  },

  getDocumentById: async (id: string) => {
    return fetchApi(`/documents/${id}`);
  },

  createDocument: async (data: Partial<DocumentTemplate>) => {
    return fetchApi("/documents", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateDocument: async (id: string, data: Partial<DocumentTemplate>) => {
    return fetchApi(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteDocument: async (id: string) => {
    return fetchApi(`/documents/${id}`, {
      method: "DELETE",
    });
  },

  exportDocuments: async (query: DocumentQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/documents/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export documents");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `documents_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importDocuments: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/documents/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import documents");
    }

    return response.json();
  },

  generateDocument: async (id: string, data: Record<string, any> = {}) => {
    return fetchApi(`/documents/generate/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};