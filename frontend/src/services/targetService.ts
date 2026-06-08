import { fetchApi } from "@/lib/api";
import { Target, TargetQuery, LeaderboardEntry } from "@/types/target";

export const TargetService = {
  getTargets: async (query: TargetQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/targets?${params.toString()}`);
  },

  getTargetById: async (id: string) => {
    return fetchApi(`/targets/${id}`);
  },

  createTarget: async (data: Partial<Target>) => {
    return fetchApi("/targets", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTarget: async (id: string, data: Partial<Target>) => {
    return fetchApi(`/targets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTarget: async (id: string) => {
    return fetchApi(`/targets/${id}`, {
      method: "DELETE",
    });
  },

  getLeaderboard: async (query: TargetQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/targets/leaderboard?${params.toString()}`);
  },

  exportTargets: async (query: TargetQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/targets/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export targets");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `targets_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importTargets: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/targets/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import targets");
    }

    return response.json();
  },
};