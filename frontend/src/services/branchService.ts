import { fetchApi } from "@/lib/api";
import { Branch, BranchQuery } from "@/types/branch";

export const BranchService = {
  getBranches: async (query: BranchQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
    return fetchApi(`/branches?${params.toString()}`);
  },

  getBranchById: async (id: string) => {
    return fetchApi(`/branches/${id}`);
  },

  createBranch: async (data: Partial<Branch>) => {
    return fetchApi("/branches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateBranch: async (id: string, data: Partial<Branch>) => {
    return fetchApi(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteBranch: async (id: string) => {
    return fetchApi(`/branches/${id}`, {
      method: "DELETE",
    });
  },
};