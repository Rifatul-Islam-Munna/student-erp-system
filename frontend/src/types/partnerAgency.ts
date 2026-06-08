export interface PartnerAgency {
  _id?: string;
  name: string;
  code: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  contactPerson?: string;
  commissionRate?: number;
  status?: "active" | "inactive";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartnerAgencyQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}