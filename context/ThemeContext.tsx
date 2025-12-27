import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  shadow: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  primary: '#4CAF50',
  secondary: '#2196F3',
  accent: '#FF9800',
  border: '#dddddd',
  shadow: '#000000',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF5252',
  info: '#2196F3',
};

const darkTheme: ThemeColors = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  card: '#252525',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  primary: '#66BB6A',
  secondary: '#42A5F5',
  accent: '#FFB74D',
  border: '#333333',
  shadow: '#000000',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useUser();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(profile.darkMode || false);
  }, [profile.darkMode]);

  const toggleTheme = async () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    try {
      await updateProfile({ darkMode: newDarkMode });
    } catch (error) {
      console.error('Tema güncellenirken hata:', error);
    }
  };

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}