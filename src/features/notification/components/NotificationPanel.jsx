// features/notification/components/NotificationPanel.jsx
// 알림 클릭 → 해당 todo 상세로 이동. 자동 읽음 처리 + 패널 닫힘.
// 개별 삭제 버튼은 stopPropagation으로 이동과 분리.

import React from 'react';
import { useNotifications } from '../store/NotificationContext';

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전`;
  const days = Math.floor(hrs / 24);
  return `${days}일 전`;
}

function NotificationPanel({ isOpen, onClose, onOpenTodo }) {
  const { notifications, markAllAsRead, markAsRead, removeNotification } = useNotifications();

  if (!isOpen) return null;

  const handleClick = (n) => {
    markAsRead(n.id);
    onOpenTodo?.(n.todoId);
    onClose();
  };

  const today = new Date().toDateString();
  const groups = notifications.reduce((acc, n) => {
    const day = new Date(n.createdAt).toDateString();
    const group = day === today ? '오늘' : '이전 알림';
    (acc[group] ??= []).push(n);
    return acc;
  }, {});

  return (
    <div className="noti-overlay">
      <div className="noti-container">
        <div className="noti-header">
          <button className="noti-close-btn" onClick={onClose}>✕</button>
          <h2>알림</h2>
          <button className="noti-read-all" onClick={markAllAsRead}>
            모두 읽음 빗자루🧹
          </button>
        </div>

        <div className="noti-content-scroll">
          {notifications.length === 0 ? (
            <div className="noti-empty">
              <p className="noti-empty-emoji">🔔</p>
              <p>알림이 없습니다.</p>
              <p className="noti-empty-hint">할 일에 시간을 설정하면<br/>알림을 받을 수 있어요.</p>
            </div>
          ) : (
            Object.entries(groups).map(([group, list]) => (
              <div className="noti-section" key={group}>
                <h3 className="noti-date-title">{group}</h3>
                {list.map((n) => (
                  <div
                    key={n.id}
                    className={`noti-item ${n.read ? 'read' : 'unread'} clickable`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClick(n)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleClick(n);
                      }
                    }}
                  >
                    <div className="noti-icon">{n.icon}</div>
                    <div className="noti-text-area">
                      <p className="noti-desc">{n.desc}</p>
                      <span className="noti-time">{formatRelativeTime(n.createdAt)}</span>
                    </div>
                    {!n.read && <div className="unread-dot"></div>}
                    <button
                      className="noti-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                      aria-label="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
