// shared/auth/AuthContext.jsx
// 인증 상태 관리:
//  - user: Firebase User | null (로그인 상태)
//  - isGuest: 인트로에서 '비회원 이용' 선택
//  - loading: 초기 Firebase Auth 상태 확인 중

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authRepo } from '../../services/firebase/authRepo';

const AuthContext = createContext(null);

const GUEST_KEY = 'isGuestMode';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(true);

  // Firebase Auth 상태 구독
  useEffect(() => {
    const unsub = authRepo.onAuthStateChanged((u) => {
      setUser(u);
      // 로그인되면 게스트 모드 자동 해제
      if (u && isGuest) {
        setIsGuest(false);
        try { localStorage.removeItem(GUEST_KEY); } catch {}
      }
      setLoading(false);
    });
    return unsub;
  }, []); // eslint-disable-line

  const signUp = useCallback((email, password, displayName) => {
    return authRepo.signUp(email, password, displayName);
  }, []);

  const signIn = useCallback((email, password) => {
    return authRepo.signIn(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await authRepo.signOut();
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    setIsGuest(false);
  }, []);

  const sendPasswordReset = useCallback((email) => {
    return authRepo.sendPasswordReset(eamil);
  })

  const useAsGuest = useCallback(() => {
    try { localStorage.setItem(GUEST_KEY, 'true'); } catch {}
    setIsGuest(true);
  }, []);

  const exitGuest = useCallback(() => {
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    setIsGuest(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isGuest,
      isAuthenticated: !!user,
      loading,
      signUp,
      signIn,
      signOut,
      sendPasswordReset,
      useAsGuest,
      exitGuest,
    }),
    [user, isGuest, loading, signUp, signIn, signOut, sendPasswordReset, useAsGuest, exitGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
