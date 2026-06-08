export interface Message {
  _id?: string;
  to: string;
  subject: string;
  body: string;
  status: "draft" | "sent" | "failed";
  sentAt?: string | null;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  [key: string]: any;
}