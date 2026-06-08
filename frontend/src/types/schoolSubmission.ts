export interface SchoolSubmission {
  _id?: string;
  student?: string;
  school?: string;
  applicationStatus?: "pending" | "submitted" | "under_review" | "accepted" | "rejected" | "waitlisted" | "deferred" | "";
  submittedDate?: string | Date;
  visaStatus?: "not_applied" | "applied" | "approved" | "rejected" | "";
  intake?: string;
  scholarship?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolSubmissionQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  applicationStatus?: string;
  visaStatus?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}