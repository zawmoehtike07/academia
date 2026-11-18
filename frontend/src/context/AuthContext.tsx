import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login as loginAction, logout as logoutAction, type User } from '../store/slices/authSlice';

export type { User };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = (userData: User, jwtToken: string) => {
    dispatch(loginAction({ user: userData, token: jwtToken }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated,
  };
};

