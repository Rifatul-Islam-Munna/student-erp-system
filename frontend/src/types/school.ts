export interface School {
  _id?: string;
  name: string;
  country?: string;
  city?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  ranking?: number;
  tuitionFee?: number;
  applicationFee?: number;
  scholarshipAvailable?: boolean;
  programs?: string[];
  intake?: string;
  requirements?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}
