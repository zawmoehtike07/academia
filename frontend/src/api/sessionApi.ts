import axiosClient from './axiosClient';

export type SessionType = 'POMODORO' | 'CUSTOM' | 'STOPWATCH';
export type SessionStatus = 'COMPLETED' | 'ABANDONED';

export interface SessionResponse {
  id: number;
  userId: number;
  groupId: number | null;
  sessionType: string;
  sessionStatus: string;
  plannedStudySeconds: number | null;
  plannedBreakSeconds: number | null;
  startedAt: string;
  endedAt: string | null;
  actualSecondsStudied: number;
}

export interface StartSessionRequest {
  sessionType: SessionType;
  groupId?: number | null;
  plannedStudySeconds?: number | null;
  plannedBreakSeconds?: number | null;
}

export interface EndSessionRequest {
  actualSecondsStudied: number;
  endStatus: SessionStatus;
}

export const sessionApi = {
  start: async (req: StartSessionRequest): Promise<SessionResponse> => {
    const res = await axiosClient.post<SessionResponse>('/study-sessions/start', req);
    return res.data;
  },

  end: async (id: number, req: EndSessionRequest): Promise<SessionResponse> => {
    const res = await axiosClient.post<SessionResponse>(`/study-sessions/${id}/end`, req);
    return res.data;
  },

  getActive: async (): Promise<SessionResponse | null> => {
    const res = await axiosClient.get<SessionResponse>('/study-sessions/active');
    if (res.status === 204) return null;
    return res.data;
  },
};
