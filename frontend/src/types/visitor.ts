export interface Visitor {
  _id?: string;
  fullName: string;
  dateOfBirth: string | Date;
  phone: string;
  guardianPhone?: string;
  email: string;
  address?: string;
  gender: "male" | "female" | "other";
  education?: {
    examName: string;
    year: string;
    board: string;
    gpa: number;
    groupSubject: string;
  }[];
  JapaneseTest?: {
    hasCertificate: boolean;
    examType?: string;
    level?: string;
    score?: string;
  };
  visaType?: string;
  preferredCountry?: string[];
  intake?: string;
  BudgetConcerned?: boolean;
  branch?: any;
  school?: any;
  partnerAgency?: any;
  source?: string;
  counselor?: string;
  courseType?: string;
  courseName?: string;
  preferredDate?: string | Date;
  counselingNote?: string;
  status?: "new" | "contacted" | "interested" | "follow_up" | "converted" | "lost" | "inactive";
  leadScore?: number;
  leadCategory?: "hot" | "warm" | "cold" | "unscored";
  followUpDates?: {
    date: string | Date;
    note: string;
    completedAt?: string | Date;
  }[];
  lastFollowUp?: string | Date;
  nextFollowUp?: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisitorQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  leadCategory?: string;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}