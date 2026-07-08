// shared/layout/Sidebar.jsx
// 로그인 상태에 따라 프로필/로그인 버튼 다르게 표시.
// 로그인 상태: 이름 + 로그아웃 버튼
// 게스트 상태: 로그인/회원가입 버튼

import React from 'react';
import { useTodos } from '../../features/todo/store/TodoContext';
import { CATEGORY_OPTIONS } from '../../features/todo/constants';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

function Sidebar({ isOpen, onClose, onSelectCategory, onOpenStats, onOpenActivity }) {
  const { category, setCategory } = useTodos();
  const { theme, toggleTheme } = useTheme();
  const { user, isGuest, signOut, exitGuest } = useAuth();

  if (!isOpen) return null;

  const handleCategory = (value) => {
    setCategory(value);
    onSelectCategory?.();
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleGoToLogin = () => {
    exitGuest();
    onClose();
  };

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">👤</div>
          {user ? (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user.displayName || user.email.split('@')[0]}
              </div>
              <button className="sidebar-login" onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          ) : (
            <button className="sidebar-login" onClick={handleGoToLogin}>
              로그인 / 회원가입
            </button>
          )}
        </div>

        <div className="sidebar-section">
          <h4 className="sidebar-title">카테고리</h4>
          <button
            className={`sidebar-item ${!category ? 'active' : ''}`}
            onClick={() => handleCategory(null)}
          >
            📋 전체 보기
          </button>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              className={`sidebar-item ${category === c.value ? 'active' : ''}`}
              onClick={() => handleCategory(c.value)}
            >
              {c.icon} {c.label}
            </button>
          ))}
          <button className="sidebar-item muted">➕ 카테고리 추가</button>
        </div>

        <div className="sidebar-section">
          <button className="sidebar-item" onClick={onOpenActivity}>
            🕘 활동 내역{!user && ' 🔒'}
          </button>
          <button className="sidebar-item" onClick={onOpenStats}>
            📊 내 성취 통계 리포트{!user && ' 🔒'}
          </button>
          <button className="sidebar-item" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드'}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
