import { fetchApi } from "@/lib/api";
import { User, UserQuery } from "@/types/user";

export const UserService = {
  getUsers: async (query: UserQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/users?${params.toString()}`);
  },

  getUserById: async (id: string) => {
    return fetchApi(`/users/${id}`);
  },

  createUser: async (data: Partial<User>) => {
    return fetchApi("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUser: async (id: string, data: Partial<User>) => {
    return fetchApi(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (id: string) => {
    return fetchApi(`/users/${id}`, {
      method: "DELETE",
    });
  },

  getAgents: async () => {
    return fetchApi("/users/agents");
  },

  getCounselors: async () => {
    return fetchApi("/users/counselors");
  },

  getBranchUsers: async () => {
    return fetchApi("/users/branches");
  },

  searchTaskTargets: async (query: string) => {
    return fetchApi(`/users/task-targets?search=${encodeURIComponent(query)}`);
  },

  exportUsers: async (query: UserQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/users/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export users");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importUsers: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/users/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import users");
    }
    
    return response.json();
  }
};