'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Dark mode only - no light mode support
type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const theme: Theme = 'dark'; // Always dark mode

  useEffect(() => {
    setMounted(true);
    // Always set dark mode
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
