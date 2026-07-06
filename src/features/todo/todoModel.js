// features/todo/todoModel.js
// ── 데이터 모델의 "단일 진실 공급원(single source of truth)" ──

import { PRIORITY } from './constants';

/**
 * @typedef {Object} Subtask
 * @property {string}  id
 * @property {string}  text
 * @property {boolean} isDone
 *
 * @typedef {Object} Repeat
 * @property {'daily'|'weekly'|'monthly'} type
 * @property {number[]} [weekdays]  weekly일 때 요일 [0=일 ~ 6=토]
 *
 * @typedef {Object} Todo
 * @property {string}   id
 * @property {string}   text
 * @property {boolean}  isDone
 * @property {string|null} date        'YYYY-MM-DD'
 * @property {string|null} time        'HH:mm' (24시간)
 * @property {string}   priority       'none'|'low'|'medium'|'high'
 * @property {string|null} category
 * @property {Subtask[]} subtasks
 * @property {Repeat|null} repeat
 * @property {number}   order
 * @property {string}   createdAt
 * @property {string}   updatedAt
 */

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 하위 작업 팩토리 */
export function createSubtask(text = '') {
  return { id: generateId(), text: text.trim(), isDone: false };
}

/** 새 Todo 생성 */
export function createTodo(draft = {}) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    text: (draft.text ?? '').trim(),
    isDone: false,
    date: draft.date ?? null,
    time: draft.time ?? null,
    priority: draft.priority ?? PRIORITY.NONE,
    category: draft.category ?? null,
    subtasks: Array.isArray(draft.subtasks) ? draft.subtasks : [],
    repeat: draft.repeat ?? null,
    notes: draft.notes ?? '',
    order: draft.order ?? Date.now(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTodo(todo, patch = {}) {
  return { ...todo, ...patch, updatedAt: new Date().toISOString() };
}

/** raw 데이터를 안전한 Todo로 정규화 (예전 스키마 하위 호환) */
export function normalizeTodo(raw = {}) {
  const now = new Date().toISOString();
  return {
    id: raw.id ?? generateId(),
    text: raw.text ?? '',
    isDone: Boolean(raw.isDone),
    date: raw.date ?? null,
    time: raw.time ?? null,
    priority: raw.priority ?? PRIORITY.NONE,
    category: raw.category ?? null,
    subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
    repeat: raw.repeat ?? null,
    notes: raw.notes ?? '',
    order: typeof raw.order === 'number' ? raw.order : Date.now(),
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  };
}
