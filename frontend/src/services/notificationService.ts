import { fetchApi } from "@/lib/api";
import { Notification, NotificationQuery, NotificationPreferences } from "@/types/notification";

export const NotificationService = {
  getNotifications: async (query: NotificationQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/notifications?${params.toString()}`);
  },

  getUnreadCount: async () => {
    return fetchApi("/notifications/unread-count");
  },

  markAsRead: async (id: string) => {
    return fetchApi(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  markAllAsRead: async () => {
    return fetchApi("/notifications/mark-all-read", {
      method: "PUT",
    });
  },

  deleteNotification: async (id: string) => {
    return fetchApi(`/notifications/${id}`, {
      method: "DELETE",
    });
  },

  getPreferences: async () => {
    return fetchApi("/notifications/preferences");
  },

  updatePreferences: async (data: NotificationPreferences) => {
    return fetchApi("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
