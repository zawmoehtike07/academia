import axiosClient from './axiosClient';

export interface MessageResponse {
  id: number;
  groupId: number;
  senderId: number;
  senderUsername: string;
  content: string;
  messageType: string;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export const messageApi = {
  getHistory: async (groupId: number, page = 0, size = 50): Promise<MessageResponse[]> => {
    const res = await axiosClient.get<MessageResponse[]>(`/groups/${groupId}/messages`, {
      params: { page, size },
    });
    return res.data;
  },

  deleteMessage: async (groupId: number, messageId: number): Promise<void> => {
    await axiosClient.delete(`/groups/${groupId}/messages/${messageId}`);
  },
};
