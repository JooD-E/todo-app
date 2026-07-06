// services/firebase/firestoreTodoRepo.js
// 로그인 유저용 저장소. 실시간 구독 지원.

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { normalizeTodo } from '../../features/todo/todoModel';

export function createFirestoreTodoRepo(uid) {
  const collRef = collection(db, 'users', uid, 'todos');

  return {
    /**
     * 실시간 구독. 초기 로드 + 이후 변경도 자동으로 반영.
     * @returns unsubscribe 함수
     */
    subscribe(callback) {
      const q = query(collRef, orderBy('createdAt'));
      return onSnapshot(
        q,
        (snap) => {
          const todos = snap.docs.map((d) => normalizeTodo({ ...d.data(), id: d.id }));
          callback(todos);
        },
        (err) => {
          console.error('[firestore subscribe]', err);
        }
      );
    },

    async add(todo) {
      // todo.id를 문서 ID로 사용 → 낙관적 업데이트와 서버 이벤트가 같은 ID로 매칭됨
      await setDoc(doc(collRef, todo.id), todo);
    },

    async update(id, patch) {
      await updateDoc(doc(collRef, id), patch);
    },

    async remove(id) {
      await deleteDoc(doc(collRef, id));
    },
  };
}
