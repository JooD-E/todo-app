// features/todo/store/TodoContext.jsx
// user 유무에 따라 저장소를 스위치. 액션 함수에서 낙관적 dispatch + 저장소 반영.
// 반복 회차 생성 로직은 여기(action creator)에서 처리.
// isLoadingTodos: 저장소 최초 구독 응답 전까지 true (새로고침 시 빈 화면 깜빡임 방지용)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { todoReducer, initialState, ACTIONS, selectVisibleTodos } from './todoReducer';
import { createLocalTodoRepo } from '../../../services/storage/localStorageRepo';
import { createFirestoreTodoRepo } from '../../../services/firebase/firestoreTodoRepo';
import { useAuth } from '../../../shared/auth/AuthContext';
import { createTodo, createSubtask } from '../todoModel';
import { nextRepeatDate } from '../constants';

const TodoContext = createContext(null);

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function TodoProvider({ children }) {
  const { user } = useAuth();

  // ── 1. state 선언 ──
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [today, setToday] = useState(todayString);
  const [isLoadingTodos, setIsLoadingTodos] = useState(true);

  // ── 2. ref 선언 ──
  const todosRef = useRef(state.todos);
  useEffect(() => {
    todosRef.current = state.todos;
  }, [state.todos]);

  // ── 3. repo 생성 (다른 곳에서 참조하기 전에 반드시 먼저 선언) ──
  const repo = useMemo(
    () => (user ? createFirestoreTodoRepo(user.uid) : createLocalTodoRepo()),
    [user]
  );

  // ── 4. repo 구독 ──
  useEffect(() => {
    setIsLoadingTodos(true);
    const unsub = repo.subscribe(
      (todos) => {
        dispatch({ type: ACTIONS.INIT, payload: todos });
        setIsLoadingTodos(false);
      },
      (err) => {
        // Firestore 권한/네트워크 에러 시 로딩 스피너 무한 방지
        console.error('[TodoContext subscribe error]', err);
        setIsLoadingTodos(false);
      }
    );
    return unsub;
  }, [repo]);

  // ── 5. 자정 감지: 매 분 today 갱신 ──
  useEffect(() => {
    const t = setInterval(() => {
      const now = todayString();
      setToday((prev) => (prev !== now ? now : prev));
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  // ── 6. 이월 처리 ──
  useEffect(() => {
    const now = new Date().toISOString();
    const overdue = state.todos.filter(
      (t) => !t.isDone && (!t.date || t.date < today)
    );
    if (overdue.length === 0) return;

    dispatch({ type: ACTIONS.ROLLOVER, today });

    overdue.forEach((t) => {
      repo.update(t.id, { date: today, updatedAt: now }).catch(console.error);
    });
  }, [today, state.todos, repo]);

  // ── 액션 함수들 (모두 repo 선언 이후에 위치) ──

  const addTodo = useCallback(
    async (draft) => {
      const todo = createTodo(draft);
      dispatch({ type: ACTIONS.ADD, payload: todo });
      try {
        await repo.add(todo);
      } catch (err) {
        console.error('[addTodo]', err);
        dispatch({ type: ACTIONS.DELETE, id: todo.id });
      }
    },
    [repo]
  );

  const editTodo = useCallback(
    async (id, patch) => {
      const finalPatch = { ...patch, updatedAt: new Date().toISOString() };
      dispatch({ type: ACTIONS.EDIT, id, patch: finalPatch });
      try {
        await repo.update(id, finalPatch);
      } catch (err) {
        console.error('[editTodo]', err);
      }
    },
    [repo]
  );

  const toggleTodo = useCallback(
    async (id) => {
      const target = todosRef.current.find((t) => t.id === id);
      if (!target) return;

      const willComplete = !target.isDone;
      const nowIso = new Date().toISOString();
      const patch = { isDone: willComplete, updatedAt: nowIso };

      dispatch({ type: ACTIONS.EDIT, id, patch });
      try {
        await repo.update(id, patch);
      } catch (err) {
        console.error('[toggleTodo]', err);
      }

      if (willComplete && target.repeat) {
        const nextDate = nextRepeatDate(target.date, target.repeat);
        if (nextDate) {
          const nextTodo = createTodo({
            text: target.text,
            date: nextDate,
            time: target.time,
            priority: target.priority,
            category: target.category,
            subtasks: (target.subtasks || []).map((s) => createSubtask(s.text)),
            repeat: target.repeat,
            notes: target.notes || '',
          });
          dispatch({ type: ACTIONS.ADD, payload: nextTodo });
          try {
            await repo.add(nextTodo);
          } catch (err) {
            console.error('[toggleTodo:repeat]', err);
          }
        }
      }
    },
    [repo]
  );

  const deleteTodo = useCallback(
    async (id) => {
      dispatch({ type: ACTIONS.DELETE, id });
      try {
        await repo.remove(id);
      } catch (err) {
        console.error('[deleteTodo]', err);
      }
    },
    [repo]
  );

  const setFilter = useCallback(
    (filter) => dispatch({ type: ACTIONS.SET_FILTER, filter }),
    []
  );
  const setCategory = useCallback(
    (category) => dispatch({ type: ACTIONS.SET_CATEGORY, category }),
    []
  );
  const setSort = useCallback((sort) => dispatch({ type: ACTIONS.SET_SORT, sort }), []);

  const value = useMemo(
    () => ({
      todos: selectVisibleTodos(state),
      allTodos: state.todos,
      filter: state.filter,
      category: state.category,
      sort: state.sort,
      today,
      isLoadingTodos,
      addTodo,
      editTodo,
      toggleTodo,
      deleteTodo,
      setFilter,
      setCategory,
      setSort,
    }),
    [
      state,
      today,
      isLoadingTodos,
      addTodo,
      editTodo,
      toggleTodo,
      deleteTodo,
      setFilter,
      setCategory,
      setSort,
    ]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within <TodoProvider>');
  return ctx;
}
