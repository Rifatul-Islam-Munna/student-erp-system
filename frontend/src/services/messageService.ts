import { fetchApi } from "@/lib/api";
import { Message, MessageQuery } from "@/types/message";

export const MessageService = {
  getMessages: async (query: MessageQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/messages?${params.toString()}`);
  },

  getMessageById: async (id: string) => {
    return fetchApi(`/messages/${id}`);
  },

  createMessage: async (data: Partial<Message>) => {
    return fetchApi("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateMessage: async (id: string, data: Partial<Message>) => {
    return fetchApi(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteMessage: async (id: string) => {
    return fetchApi(`/messages/${id}`, {
      method: "DELETE",
    });
  },

  exportMessages: async () => {
    return fetchApi("/messages/export", {
      method: "POST",
    });
  },

  importMessages: async (data: Partial<Message>[]) => {
    return fetchApi("/messages/import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};