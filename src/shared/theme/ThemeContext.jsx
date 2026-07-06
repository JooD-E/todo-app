// shared/theme/ThemeContext.jsx
// 라이트/다크 테마. localStorage에 저장하고, data-theme 값을 노출합니다.
// 실제 적용(data-theme 속성)은 AppShell의 .phone-wrapper에서 합니다.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);
const KEY = 'theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) || 'light');

  useEffect(() => {
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
