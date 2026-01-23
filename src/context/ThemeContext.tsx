// src/context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  // Mantener todos tus colores actuales
  success: '#17a2b8',
  primary: '#138496',
  info: '#17a2b8',
  error: '#F56E5B',
  danger: '#E53D35',
  warning: '#FFBB33',
  darkBlue: '#151e39',
  darkSilver: '#2B2B2B',
  silver: '#606464',
  mediumSilver: '#777',
  softBlue: '#3bb4c7',
  softSilver: '#E8E8E8',
  softGreen: '#CEFFE6',
  green: '#69BB79',
  dark: '#2A2A2A',
  blue: '#17a2b8',
  yellow: '#ffc107',
  chatGreen: '#dcf8c6',
  white: '#FFFFFF',
  black: '#000000',
  
  // Los que cambiarán
  background: '#F5F5F5',
  backgroundCard: '#FFFFFF',
  backgroundGray: '#F5F5F5',
  borderGray: '#E0E0E0',
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
};

const darkColors = {
  // Mantener colores base iguales
  success: '#17a2b8',
  primary: '#138496',
  info: '#17a2b8',
  error: '#F56E5B',
  danger: '#E53D35',
  warning: '#FFBB33',
  darkBlue: '#151e39',
  darkSilver: '#2B2B2B',
  silver: '#606464',
  mediumSilver: '#777',
  softBlue: '#3bb4c7',
  softSilver: '#38383A',
  softGreen: '#1C3A2E',
  green: '#69BB79',
  dark: '#2A2A2A',
  blue: '#17a2b8',
  yellow: '#ffc107',
  chatGreen: '#1C3A2E',
  white: '#000000',
  black: '#FFFFFF',
  
  // Los importantes para modo oscuro
  background: '#000000',
  backgroundCard: '#1C1C1E',
  backgroundGray: '#2C2C2E',
  borderGray: '#38383A',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.log('Error cargando tema:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.log('Error guardando tema:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);