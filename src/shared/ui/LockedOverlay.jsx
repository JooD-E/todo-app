// shared/ui/LockedOverlay.jsx
// 로그인이 필요한 콘텐츠를 감싸는 게이팅 wrapper.
// - 로그인 상태: children 그대로 표시
// - 미로그인/게스트: 자식은 blur, 위에 CTA 오버레이

import React from 'react';
import { useAuth } from '../auth/AuthContext';

function LockedOverlay({
  children,
  message = '로그인하면 확인할 수 있어요',
  hint,
  compact = false,
}) {
  const { user, isGuest, exitGuest } = useAuth();

  // 로그인된 상태: 그대로 통과
  if (user) return children;

  const handleLoginClick = () => {
    // 게스트라면 게스트 해제 → 인트로/로그인 페이지로 자동 이동
    if (isGuest) exitGuest();
  };

  return (
    <div className={`locked-wrapper ${compact ? 'compact' : ''}`}>
      <div className="locked-content">{children}</div>
      <div className="locked-overlay">
        <div className="locked-icon">🔒</div>
        <p className="locked-message">{message}</p>
        {hint && <p className="locked-hint">{hint}</p>}
        <button type="button" className="locked-btn" onClick={handleLoginClick}>
          로그인하기
        </button>
      </div>
    </div>
  );
}

export default LockedOverlay;
