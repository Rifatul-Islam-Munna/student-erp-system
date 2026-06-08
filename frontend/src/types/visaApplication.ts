export interface VisaApplication {
  _id?: string;
  student?: any;
  passportNumber?: string;
  visaType?: string;
  applicationDate?: string | Date;
  interviewDate?: string | Date;
  status?: "pending" | "interview_scheduled" | "approved" | "rejected" | "documents_requested" | "withdrawn";
  visaGrantDate?: string | Date;
  visaExpiryDate?: string | Date;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisaApplicationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface VisaPipeline {
  status: string;
  count: number;
}