import axiosClient from './axiosClient';

export interface DashboardResponse {
  todaySeconds: number;
  sessionsCompletedToday: number;
  weekSeconds: number;
  weekAverageSecondsPerDay: number;
  monthSeconds: number;
  monthAverageSecondsPerDay: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalSeconds: number;
  totalSessions: number;
  groupsJoined: number;
  charts: {
    daily: { date: string; seconds: number }[];
    weekly: { label: string; seconds: number }[];
    monthly: { month: string; seconds: number }[];
  };
}

export const dashboardApi = {
  get: async (): Promise<DashboardResponse> => {
    const res = await axiosClient.get<DashboardResponse>('/dashboard');
    return res.data;
  },
};
