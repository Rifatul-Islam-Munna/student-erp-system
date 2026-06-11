import { fetchApi } from "@/lib/api";
import { DocumentQuery, DocumentTemplate } from "@/types/document";

export const DocumentService = {
  getTemplateSourceBlob: async (id: string) => {
    const token = localStorage.getItem("auth_token");
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    const response = await fetch(`${apiBase}/documents/${id}/source`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || "Failed to download source file") as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return response.blob();
  },

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

  uploadTemplateSource: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    const response = await fetch(`${apiBase}/documents/${id}/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to upload source file");
    }

    return response.json();
  },

  downloadTemplateSource: async (id: string, fileName?: string) => {
    const blob = await DocumentService.getTemplateSourceBlob(id);
    const { saveAs } = await import("file-saver");
    saveAs(blob, fileName || "template-source");
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

  getAvailableVariables: async () => {
    return fetchApi("/documents/shortcodes");
  },

  generateFileBlob: async (data: { templateId: string; studentId?: string; outputFormat?: "pdf" | "docx" | "xlsx" }) => {
    const token = localStorage.getItem("auth_token");
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

    const response = await fetch(`${apiBase}/documents/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || "Failed to generate document") as Error & Record<string, any>;
      Object.assign(error, errorData);
      throw error;
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const matchedFileName = disposition.match(/filename="([^"]+)"/i)?.[1];
    const contentType = response.headers.get("Content-Type") || "";

    return { blob, matchedFileName, contentType };
  },

  generateAndDownloadFile: async (data: { templateId: string; studentId?: string; outputFormat?: "pdf" | "docx" | "xlsx" }, fileName: string) => {
    const { blob, matchedFileName, contentType } = await DocumentService.generateFileBlob(data);
    const { saveAs } = await import("file-saver");
    const extension = matchedFileName?.split(".").pop()
      || (contentType.includes("spreadsheetml") ? "xlsx" : contentType.includes("wordprocessingml") ? "docx" : "pdf");
    const normalizedFileName = matchedFileName || (fileName.endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`);
    saveAs(blob, normalizedFileName);
  },

  generateAndDownloadPdf: async (data: { templateId: string; studentId?: string; outputFormat?: "pdf" | "docx" | "xlsx" }, fileName: string) =>
    DocumentService.generateAndDownloadFile(data, fileName),
};
