export interface Event {
  _id?: string;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate?: string | Date;
  location?: string;
  attendees?: string[];
  reminder?: {
    enabled: boolean;
    time?: number;
    unit?: "minutes" | "hours" | "days";
  };
  status?: "scheduled" | "ongoing" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface EventQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}