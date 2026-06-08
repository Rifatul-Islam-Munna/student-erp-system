import { fetchApi } from "@/lib/api";
import { SettingDocument, SettingResponse } from "@/types/setting";

export const SettingService = {
  getAll: async () => {
    return fetchApi("/settings") as Promise<SettingResponse>;
  },

  update: async (payload: Partial<SettingDocument>) => {
    return fetchApi("/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
