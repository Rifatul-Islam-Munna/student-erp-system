export interface Target {
  _id?: string;
  user: string;
  type: string;
  targetAmount: number;
  achievedAmount: number;
  period: "monthly" | "yearly";
  startDate: string | Date;
  endDate: string | Date;
  status: "active" | "completed" | "cancelled" | "expired";
  createdAt?: string;
  updatedAt?: string;
}

export interface TargetQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  period?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}

export interface LeaderboardEntry {
  user: string;
  userName: string;
  totalTarget: number;
  totalAchieved: number;
  achievementRate: number;
}