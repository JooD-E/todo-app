// shared/layout/Navigation.jsx
// 안 읽은 알림 있으면 알림 아이콘에 빨간 점 뱃지.

import React, { useEffect, useState } from 'react';
import Icon from '../ui/Icon';
import { useNotifications } from '../../features/notification/store/NotificationContext';

function Navigation({ activeView, onOpenMenu, onOpenCalendar, onOpenSearch, onOpenNoti }) {
  const [today, setToday] = useState(() => new Date().getDate());
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getDate();
      setToday((prev) => (prev !== now ? now : prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const btnStyle = (active) => ({ opacity: active ? 1 : 0.5 });

  return (
    <nav className="app-nav">
      <button className="nav-btn" onClick={onOpenMenu} aria-label="메뉴">
        <Icon name="hamburger" alt="메뉴" />
      </button>
      <button
        className="nav-btn nav-btn-calendar"
        onClick={onOpenCalendar}
        style={btnStyle(activeView === 'calendar')}
        aria-label={`달력, 오늘 ${today}일`}
      >
        <Icon name="calendar" alt="달력" />
        <span className="nav-calendar-day">{today}</span>
      </button>
      <button
        className="nav-btn"
        onClick={onOpenSearch}
        style={btnStyle(activeView === 'search')}
        aria-label="검색"
      >
        <Icon name="search" alt="검색" />
      </button>
      <button
        className="nav-btn nav-btn-noti"
        onClick={onOpenNoti}
        aria-label={`알림${unreadCount > 0 ? `, 안 읽음 ${unreadCount}건` : ''}`}
      >
        <Icon name="notification" alt="알림" />
        {unreadCount > 0 && <span className="noti-badge" />}
      </button>
    </nav>
  );
}

export default Navigation;
