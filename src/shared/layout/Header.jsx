// shared/layout/Header.jsx
// 상태바 + 타이틀. 타이틀 클릭 시 홈(리스트)으로.

import React from 'react';

function Header({ title = 'Todo-List', onHome }) {
  return (
    <header className="app-header">
      <div className="status-bar">
        <div className="now-status"></div>
      </div>
      <button className="app-title" onClick={onHome} aria-label="홈으로">
        {title}
      </button>
    </header>
  );
}

export default Header;
