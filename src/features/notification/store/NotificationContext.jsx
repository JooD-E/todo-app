// features/notification/store/NotificationContext.jsx
// - 시간 미설정 todo는 당일 00:00으로 간주하여 알림 발송
// - 앱 마운트 시 30일 이상된 알림 자동 삭제

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTodos } from '../../todo/store/TodoContext';

const NotificationContext = createContext(null);
const STORAGE_KEY = 'myNotifications';
const RETENTION_DAYS = 30;

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('[notifications] 저장 실패', e);
  }
}

function currentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationProvider({ children }) {
  const { allTodos } = useTodos();
  const [notifications, setNotifications] = useState(loadFromStorage);

  // 마운트 시 오래된 알림 정리 (30일)
  useEffect(() => {
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    setNotifications((prev) => {
      const kept = prev.filter((n) => new Date(n.createdAt).getTime() >= cutoff);
      return kept.length === prev.length ? prev : kept;
    });
  }, []);

  // 상태 변경 시 저장
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // 리마인더: 마운트 + 매 분 체크
  useEffect(() => {
    const check = () => {
      const today = todayString();
      const nowTime = currentHHMM();

      // 조건: 오늘 마감 + 미완료 + (시간 도달 or 시간없음=00:00 취급)
      const dueTodos = allTodos.filter((t) => {
        if (t.isDone || t.date !== today) return false;
        const effectiveTime = t.time || '00:00';
        return effectiveTime <= nowTime;
      });

      if (dueTodos.length === 0) return;

      setNotifications((prev) => {
        const existing = new Set(prev.map((n) => n.sourceKey));
        const newOnes = [];

        for (const todo of dueTodos) {
          const effectiveTime = todo.time || '00:00';
          const sourceKey = `${todo.id}|${todo.date}|${effectiveTime}`;
          if (existing.has(sourceKey)) continue;

          newOnes.push({
            id: genId(),
            sourceKey,
            todoId: todo.id,
            icon: todo.time ? '⏰' : '📌',
            desc: todo.time
              ? `'${todo.text}' 시간입니다.`
              : `오늘의 할 일: '${todo.text}'`,
            createdAt: new Date().toISOString(),
            read: false,
          });
        }

        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [allTodos]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within <NotificationProvider>');
  return ctx;
}
