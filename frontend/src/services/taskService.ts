import { fetchApi } from "@/lib/api";
import { Task, TaskQuery } from "@/types/task";

export const TaskService = {
  getTasks: async (query: TaskQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/tasks?${params.toString()}`);
  },

  getTaskById: async (id: string) => {
    return fetchApi(`/tasks/${id}`);
  },

  createTask: async (data: Partial<Task>) => {
    return fetchApi("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateTask: async (id: string, data: Partial<Task>) => {
    return fetchApi(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteTask: async (id: string) => {
    return fetchApi(`/tasks/${id}`, {
      method: "DELETE",
    });
  },

  exportTasks: async (query: TaskQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/tasks/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export tasks");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importTasks: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/tasks/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import tasks");
    }

    return response.json();
  },
};