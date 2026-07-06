// services/storage/localStorageRepo.js
// 게스트용 저장소. Firestore repo와 동일한 인터페이스(subscribe/add/update/remove).
// localStorage에는 실시간 이벤트가 없으니 subscribe는 초기 1회 콜백만.

import { normalizeTodo } from '../../features/todo/todoModel';

const STORAGE_KEY = 'myTodos';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(normalizeTodo) : [];
  } catch {
    return [];
  }
}

function save(todos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('[localStorage] 저장 실패', e);
  }
}

export function createLocalTodoRepo() {
  return {
    subscribe(callback) {
      // 초기 1회만 콜백
      callback(load());
      return () => {}; // no-op unsubscribe
    },

    async add(todo) {
      const todos = load();
      todos.push(todo);
      save(todos);
    },

    async update(id, patch) {
      const todos = load();
      const idx = todos.findIndex((t) => t.id === id);
      if (idx >= 0) {
        todos[idx] = { ...todos[idx], ...patch };
        save(todos);
      }
    },

    async remove(id) {
      const todos = load();
      save(todos.filter((t) => t.id !== id));
    },
  };
}
