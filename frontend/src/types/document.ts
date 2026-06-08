export interface DocumentTemplate {
  _id?: string;
  name: string;
  type: string;
  content: string;
  fileUrl?: string;
  shortcodes: string[];
  status: "active" | "inactive" | "draft";
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}