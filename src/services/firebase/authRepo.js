// services/firebase/authRepo.js
// Firebase Auth 함수 래퍼. 에러 메시지를 한국어로 변환.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

// Firebase 에러 코드 → 한국어 메시지
const ERROR_MESSAGES = {
  'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
  'auth/invalid-email': '유효하지 않은 이메일 형식입니다.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/user-not-found': '가입되지 않은 이메일입니다.',
  'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '너무 많은 시도. 잠시 후 다시 시도해주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
};

function toFriendlyMessage(err) {
  return ERROR_MESSAGES[err.code] || '오류가 발생했습니다. 다시 시도해주세요.';
}

export const authRepo = {
  async signUp(email, password, displayName) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      return cred.user;
    } catch (err) {
      throw new Error(toFriendlyMessage(err));
    }
  },

  async signIn(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      throw new Error(toFriendlyMessage(err));
    }
  },

  async signOut() {
    await fbSignOut(auth);
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  async sendPasswordReset(email){
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      throw new Error(toFriendlyMessage(err));
    }
  }
};
