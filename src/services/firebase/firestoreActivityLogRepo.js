// services/firebase/firestoreActivityLogRepo.js
// 사용자별 활동 로그 저장소. 최근 200개까지만 조회 (성능 + 할당량 관리).

import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

const MAX_LOGS = 200;

export function createFirestoreActivityLogRepo(uid) {
  const collRef = collection(db, 'users', uid, 'activityLogs');

  return {
    subscribe(callback, errorCallback) {
      const q = query(collRef, orderBy('createdAt', 'desc'), limit(MAX_LOGS));
      return onSnapshot(
        q,
        (snap) => {
          const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          callback(logs);
        },
        (err) => {
          console.error('[activityLog subscribe]', err);
          if (errorCallback) errorCallback(err);
        }
      );
    },

    async add(entry) {
      await addDoc(collRef, {
        ...entry,
        createdAt: new Date().toISOString(),
      });
    },

    async clearAll() {
      const snap = await getDocs(collRef);
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    },
  };
}
