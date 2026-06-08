export interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  [key: string]: any;
}