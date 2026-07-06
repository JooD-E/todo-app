// pages/IntroPage.jsx
// 앱 첫 화면. 시작하기 → 로그인 / 회원가입 / 비회원 이용 3가지 선택지.

import React from 'react';
import { useAuth } from '../shared/auth/AuthContext';

function IntroPage({ onNavigateToAuth }) {
  const { useAsGuest } = useAuth();

  return (
    <div className="phone-wrapper intro-page">
      <div className="intro-content">
        <div className="intro-logo">✅</div>
        <h1 className="intro-title">Todo-List</h1>
        <p className="intro-desc">
          하루의 할 일을 정리하고<br/>
          꾸준한 성취를 기록해보세요.
        </p>

        <div className="intro-actions">
          <button
            className="intro-btn intro-btn-primary"
            onClick={() => onNavigateToAuth('signin')}
          >
            로그인
          </button>
          <button
            className="intro-btn intro-btn-outline"
            onClick={() => onNavigateToAuth('signup')}
          >
            회원가입
          </button>
          <button
            className="intro-btn intro-btn-ghost"
            onClick={useAsGuest}
          >
            비회원으로 시작
          </button>
        </div>

        <p className="intro-hint">
          비회원 이용 시 데이터가 이 기기에만 저장됩니다.
        </p>
      </div>
    </div>
  );
}

export default IntroPage;
