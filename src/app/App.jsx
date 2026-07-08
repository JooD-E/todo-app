// app/App.jsx
// 진입 라우팅:
//  loading → 스플래시
//  !user && !isGuest → IntroPage
//  authPage 있음 → AuthPage
//  그 외 → AppShell (앱 본체)

import React, { useState } from 'react';
import { TodoProvider } from '../features/todo/store/TodoContext';
import { NotificationProvider } from '../features/notification/store/NotificationContext';
import { ActivityLogProvider } from '../features/activity/store/ActivityLogContext';
import { ThemeProvider } from '../shared/theme/ThemeContext';
import { AuthProvider, useAuth } from '../shared/auth/AuthContext';
import IntroPage from '../pages/IntroPage';
import AuthPage from '../pages/AuthPage';
import AppShell from './AppShell';

function AppRouter() {
  const { user, isGuest, loading } = useAuth();
  const [authPageMode, setAuthPageMode] = useState(null); // null | 'signin' | 'signup'

  if (loading) {
    return (
      <div className="phone-wrapper splash">
        <div className="splash-content">
          <div className="splash-logo">✅</div>
          <div className="splash-spinner"></div>
        </div>
      </div>
    );
  }

  // 로그인 안 됨 + 게스트 아님 → 인트로 or 로그인 페이지
  if (!user && !isGuest) {
    if (authPageMode) {
      return (
        <AuthPage
          initialMode={authPageMode}
          onBack={() => setAuthPageMode(null)}
        />
      );
    }
    return <IntroPage onNavigateToAuth={(mode) => setAuthPageMode(mode)} />;
  }

  // 로그인됨 또는 게스트 → 앱 본체
  return (
    <ActivityLogProvider>
      <TodoProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </TodoProvider>
    </ActivityLogProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
