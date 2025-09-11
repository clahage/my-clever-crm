import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Modes: 'light', 'medium', 'dark'
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });
  const [font, setFont] = useState(() => {
    return localStorage.getItem('themeFont') || 'Inter, Arial, sans-serif';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    localStorage.setItem('themeFont', font);
    // Remove all theme classes
    document.documentElement.classList.remove('light', 'dark', 'medium', 'theme-medium');
    // Add current mode as class
    document.documentElement.classList.add(mode);
    if (mode === 'medium') document.documentElement.classList.add('theme-medium');
    // Set font family globally
    document.body.style.fontFamily = font;
  }, [mode, font]);

  const setTheme = (newMode) => setMode(newMode);
  const setThemeFont = (newFont) => setFont(newFont);

  return (
    <ThemeContext.Provider value={{ mode, setTheme, font, setThemeFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
