import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme as toggleThemeAction, type Theme } from '../store/slices/themeSlice';

export type { Theme };

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return { theme, toggleTheme };
}

