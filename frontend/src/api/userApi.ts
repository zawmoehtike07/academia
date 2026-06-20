import axiosClient from './axiosClient';

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  pomodoroStudyMinutes: number;
  pomodoroBreakMinutes: number;
}

export const userApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    const res = await axiosClient.get<ProfileResponse>('/auth/profile');
    return res.data;
  },

  updateProfile: async (data: { username?: string; email?: string }): Promise<ProfileResponse> => {
    const res = await axiosClient.put<ProfileResponse>('/auth/profile', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await axiosClient.post('/auth/change-password', data);
  },

  updatePreferences: async (data: { pomodoroStudyMinutes: number; pomodoroBreakMinutes: number }): Promise<ProfileResponse> => {
    const res = await axiosClient.put<ProfileResponse>('/auth/preferences', data);
    return res.data;
  },
};
