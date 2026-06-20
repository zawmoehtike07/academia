import axiosClient from './axiosClient';

export interface GroupResponse {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerUsername: string;
  createdAt: string;
  memberCount: number;
}

export interface MemberResponse {
  userId: number;
  username: string;
  email: string;
  joinedAt: string;
  isOwner: boolean;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export const groupApi = {
  getMyGroups: async (): Promise<GroupResponse[]> => {
    const res = await axiosClient.get<GroupResponse[]>('/groups');
    return res.data;
  },

  getGroup: async (id: number): Promise<GroupResponse> => {
    const res = await axiosClient.get<GroupResponse>(`/groups/${id}`);
    return res.data;
  },

  createGroup: async (req: CreateGroupRequest): Promise<GroupResponse> => {
    const res = await axiosClient.post<GroupResponse>('/groups', req);
    return res.data;
  },

  deleteGroup: async (id: number): Promise<void> => {
    await axiosClient.delete(`/groups/${id}`);
  },

  joinGroup: async (id: number): Promise<void> => {
    await axiosClient.post(`/groups/${id}/join`);
  },

  addMember: async (groupId: number, username: string): Promise<void> => {
    await axiosClient.post(`/groups/${groupId}/members`, { username });
  },

  leaveGroup: async (id: number): Promise<void> => {
    await axiosClient.post(`/groups/${id}/leave`);
  },

  getMembers: async (id: number): Promise<MemberResponse[]> => {
    const res = await axiosClient.get<MemberResponse[]>(`/groups/${id}/members`);
    return res.data;
  },
};
