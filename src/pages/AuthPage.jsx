// pages/AuthPage.jsx
// mode: 'signin' | 'signup' | 'reset'
// - signin/signup: 기존 폼
// - reset: 이메일만 입력 → 재설정 링크 발송

import React, { useState } from 'react';
import { useAuth } from '../shared/auth/AuthContext';

function AuthPage({ initialMode = 'signin', onBack }) {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === 'signup';
  const isReset = mode === 'reset';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setInfo('');
  };

  const switchMode = (next) => {
    setMode(next);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    if (isReset) {
      setSubmitting(true);
      try {
        await sendPasswordReset(email.trim());
        setInfo('재설정 링크를 이메일로 보냈어요. 받은 편지함(스팸함 포함)을 확인해주세요.');
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password, displayName.trim() || undefined);
      } else {
        await signIn(email.trim(), password);
      }
      // 성공 → onAuthStateChanged가 감지해서 자동 라우팅
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="phone-wrapper auth-page">
      <header className="auth-header">
        <button className="auth-back" onClick={onBack} aria-label="뒤로">
          ←
        </button>
      </header>

      <div className="auth-content">
        <h1 className="auth-title">
          {isReset ? '비밀번호 찾기' : isSignUp ? '회원가입' : '로그인'}
        </h1>

        {!isReset && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${!isSignUp ? 'active' : ''}`}
              onClick={() => switchMode('signin')}
            >
              로그인
            </button>
            <button
              type="button"
              className={`auth-tab ${isSignUp ? 'active' : ''}`}
              onClick={() => switchMode('signup')}
            >
              회원가입
            </button>
          </div>
        )}

        {isReset && (
          <p className="auth-reset-hint">
            가입한 이메일을 입력하시면<br/>
            비밀번호 재설정 링크를 보내드려요.
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="auth-field">
              <label htmlFor="auth-name">닉네임 (선택)</label>
              <input
                id="auth-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="사용할 이름"
                autoComplete="nickname"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">이메일</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              required
            />
          </div>

          {!isReset && (
            <div className="auth-field">
              <label htmlFor="auth-password">비밀번호</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? '6자 이상' : '비밀번호'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting
              ? '처리 중...'
              : isReset
              ? '재설정 링크 보내기'
              : isSignUp
              ? '가입하기'
              : '로그인'}
          </button>
        </form>

        {mode === 'signin' && (
          <p className="auth-alt">
            비밀번호를 잊으셨나요?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => switchMode('reset')}
            >
              비밀번호 찾기
            </button>
          </p>
        )}

        {isReset && (
          <p className="auth-alt">
            <button
              type="button"
              className="auth-link"
              onClick={() => switchMode('signin')}
            >
              ← 로그인으로 돌아가기
            </button>
          </p>
        )}

        {!isReset && (
          <p className="auth-alt">
            {isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}{' '}
            <button
              type="button"
              className="auth-link"
              onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}
            >
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
