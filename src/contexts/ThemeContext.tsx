import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {useColorScheme} from 'react-native';
import {Theme, ThemeMode} from '../types';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme: Theme = {
  mode: 'light',
  dark: false,
  colors: {
    background: '#ffffff',
    card: '#f5f5f5',
    text: '#000000',
    subtext: '#666666',
    border: '#e0e0e0',
    accent: '#25D366', // WhatsApp green
    error: '#ff3b30',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  dark: true,
  colors: {
    background: '#0d0d0d',
    card: '#1a1a1a',
    text: '#ffffff',
    subtext: '#999999',
    border: '#333333',
    accent: '#25D366', // WhatsApp green
    error: '#ff453a',
  },
};

export const ThemeProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<Theme>(
    systemColorScheme === 'dark' ? darkTheme : lightTheme,
  );

  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme === 'dark' ? darkTheme : lightTheme);
    } else {
      setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
    }
  }, [themeMode, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{theme, themeMode, setThemeMode}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
