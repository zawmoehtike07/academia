import axios from 'axios';

// Plain instance — no JWT interceptor so stale tokens can't block auth routes
const authAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await authAxios.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  register: async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await authAxios.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
};

