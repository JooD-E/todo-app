// features/activity/store/ActivityLogContext.jsx
// 로그인 유저: Firestore 저장 + 실시간 구독
// 게스트/미로그인: 로그 저장 안 함 (addLog는 no-op)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createFirestoreActivityLogRepo } from '../../../services/firebase/firestoreActivityLogRepo';
import { useAuth } from '../../../shared/auth/AuthContext';

const ActivityLogContext = createContext(null);

export function ActivityLogProvider({ children }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const repo = useMemo(
    () => (user ? createFirestoreActivityLogRepo(user.uid) : null),
    [user]
  );

  useEffect(() => {
    if (!repo) {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsub = repo.subscribe(
      (data) => {
        setLogs(data);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return unsub;
  }, [repo]);

  const addLog = useCallback(
    (entry) => {
      if (!repo) return; // 게스트: 조용히 무시
      repo.add(entry).catch((err) => console.error('[addLog]', err));
    },
    [repo]
  );

  const clearAllLogs = useCallback(async () => {
    if (!repo) return;
    try {
      await repo.clearAll();
    } catch (err) {
      console.error('[clearAllLogs]', err);
    }
  }, [repo]);

  const value = useMemo(
    () => ({ logs, isLoading, addLog, clearAllLogs }),
    [logs, isLoading, addLog, clearAllLogs]
  );

  return (
    <ActivityLogContext.Provider value={value}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within <ActivityLogProvider>');
  return ctx;
}
