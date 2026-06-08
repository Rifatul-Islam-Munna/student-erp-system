import { fetchApi } from "@/lib/api";
import { Event, EventQuery } from "@/types/event";

export const EventService = {
  getEvents: async (query: EventQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/events?${params.toString()}`);
  },

  getEventById: async (id: string) => {
    return fetchApi(`/events/${id}`);
  },

  createEvent: async (data: Partial<Event>) => {
    return fetchApi("/events", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: Partial<Event>) => {
    return fetchApi(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string) => {
    return fetchApi(`/events/${id}`, {
      method: "DELETE",
    });
  },

  exportEvents: async (query: EventQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/events/export?${params.toString()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to export events");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `events_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  importEvents: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"}/events/import`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to import events");
    }

    return response.json();
  },
};