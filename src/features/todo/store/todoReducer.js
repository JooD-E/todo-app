// features/todo/store/todoReducer.js
// CRUD + 필터/정렬 액션을 한곳에 모읍니다.

import { createTodo, updateTodo } from '../todoModel';
import { FILTER, SORT, PRIORITY_WEIGHT } from '../constants';

export const initialState = {
  todos: [],
  filter: FILTER.ALL, 
  category: null,
  sort: SORT.PRIORITY,
};

export const ACTIONS = {
  INIT: 'INIT',
  ADD: 'ADD',
  EDIT: 'EDIT',
  TOGGLE: 'TOGGLE',
  DELETE: 'DELETE',
  REORDER: 'REORDER',
  ROLLOVER: 'ROLLOVER',
  SET_FILTER: 'SET_FILTER',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_SORT: 'SET_SORT',
};

export function todoReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT:
      return { ...state, todos: action.payload };

    case ACTIONS.ADD:
      return { ...state, todos: [...state.todos, action.payload] };

    case ACTIONS.EDIT:
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? updateTodo(t, action.patch) : t
        ),
      };

    case ACTIONS.TOGGLE:
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id
          ? {...t, isDone: !t.isDone, updatedAt: new Date().toISOString()}
          : t
        ),
      };
    

    case ACTIONS.DELETE:
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };

    case ACTIONS.REORDER:
      return {
        ...state,
        todos: state.todos.map((t) => {
          const idx = action.payload.indexOf(t.id);
          return idx === -1 ? t : updateTodo(t, { order: idx });
        }),
      };

    case ACTIONS.SET_FILTER:
      return { ...state, filter: action.filter };

    case ACTIONS.SET_CATEGORY:
      return { ...state, category: action.category };

    case ACTIONS.SET_SORT:
      return { ...state, sort: action.sort };

    case ACTIONS.ROLLOVER: {
      const now = new Date().toISOString();
      let changed = false;
      const rolled = state.todos.map((t) => {
        if (!t.isDone && (!t.date || t.date < action.today)) {
          changed = true;
          return { ...t, date: action.today, updatedAt: now };
        }
        return t;
      });
      return changed ? { ...state, todos: rolled } : state;
    }

    default:
      return state;
  }
}

// ── Selectors ──

export function selectVisibleTodos(state) {
  const { todos, filter, category, sort } = state;

  const filtered = todos.filter((t) => {
    if (filter === FILTER.ACTIVE && t.isDone) return false;
    if (filter === FILTER.DONE && !t.isDone) return false;
    if (category && t.category !== category) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;
    
    switch (sort) {
      case SORT.DATE:
        return (a.date ?? '9999').localeCompare(b.date ?? '9999');
      case SORT.PRIORITY:
        return (
          (PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]) ||
          a.createdAt.localeCompare(b.createdAt)
        );
      case SORT.MANUAL:
        return a.order - b.order;
      case SORT.CREATED:
      default:
        return a.createdAt.localeCompare(b.createdAt);
    }
  });
}

export function selectProgress(todos) {
  if (todos.length === 0) return 0;
  const done = todos.filter((t) => t.isDone).length;
  return Math.round((done / todos.length) * 100);
}
