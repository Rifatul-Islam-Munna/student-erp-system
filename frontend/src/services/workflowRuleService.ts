import { fetchApi } from "@/lib/api";
import { WorkflowRule, WorkflowRuleQuery } from "@/types/workflowRule";

export const WorkflowRuleService = {
  getWorkflowRules: async (query: WorkflowRuleQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/workflow-rules?${params.toString()}`);
  },

  getWorkflowRuleById: async (id: string) => {
    return fetchApi(`/workflow-rules/${id}`);
  },

  createWorkflowRule: async (data: Partial<WorkflowRule>) => {
    return fetchApi("/workflow-rules", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateWorkflowRule: async (id: string, data: Partial<WorkflowRule>) => {
    return fetchApi(`/workflow-rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteWorkflowRule: async (id: string) => {
    return fetchApi(`/workflow-rules/${id}`, {
      method: "DELETE",
    });
  },

  toggleWorkflowRule: async (id: string, isActive: boolean) => {
    return fetchApi(`/workflow-rules/${id}/toggle`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  },

  exportWorkflowRules: async (query: WorkflowRuleQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/workflow-rules/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export workflow rules");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-rules_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importWorkflowRules: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/workflow-rules/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import workflow rules");
    }

    return response.json();
  },
};
