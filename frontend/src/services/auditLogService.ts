import { fetchApi } from "@/lib/api";
import { AuditLog, AuditLogQuery, AuditLogStats } from "@/types/auditLog";

export const AuditLogService = {
  getAuditLogs: async (query: AuditLogQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/audit-logs?${params.toString()}`);
  },

  getAuditLogById: async (id: string) => {
    return fetchApi(`/audit-logs/${id}`);
  },

  getAuditLogStats: async (query: AuditLogQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/audit-logs/stats?${params.toString()}`);
  },

  exportAuditLogs: async (query: AuditLogQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/audit-logs/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export audit logs");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};