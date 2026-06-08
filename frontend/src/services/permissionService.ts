import { fetchApi } from "@/lib/api";
import { Permission, PermissionQuery } from "@/types/permission";

export const PermissionService = {
  getPermissions: async (query: PermissionQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/permissions?${params.toString()}`);
  },

  getPermissionById: async (id: string) => {
    return fetchApi(`/permissions/${id}`);
  },

  createPermission: async (data: Partial<Permission>) => {
    return fetchApi("/permissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updatePermission: async (id: string, data: Partial<Permission>) => {
    return fetchApi(`/permissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deletePermission: async (id: string) => {
    return fetchApi(`/permissions/${id}`, {
      method: "DELETE",
    });
  },

  getPermissionKeys: async () => {
    return fetchApi("/permissions/keys");
  },
};
