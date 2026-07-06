// features/todo/store/TodoContext.jsx
// user 유무에 따라 저장소를 스위치. 액션 함수에서 낙관적 dispatch + 저장소 반영.
// 반복 회차 생성 로직은 여기(action creator)에서 처리.

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
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const [today, setToday] = useState(todayString);

  // 액션 함수에서 최신 todos를 참조하기 위한 ref
  const todosRef = useRef(state.todos);
  useEffect(() => {
    todosRef.current = state.todos;
  }, [state.todos]);

  // 저장소 스위치: 로그인 유저 → Firestore, 게스트 → localStorage
  const repo = useMemo(
    () => (user ? createFirestoreTodoRepo(user.uid) : createLocalTodoRepo()),
    [user]
  );

  // 저장소 구독 (Firestore는 실시간, localStorage는 초기 1회)
  useEffect(() => {
    const unsub = repo.subscribe((todos) => {
      dispatch({ type: ACTIONS.INIT, payload: todos });
    });
    return unsub;
  }, [repo]);

  // 자정 감지: 매 분 today 갱신
  useEffect(() => {
    const t = setInterval(() => {
      const now = todayString();
      setToday((prev) => (prev !== now ? now : prev));
    }, 60_000);
    return () => clearInterval(t);
  }, []);

  // 이월 처리: today가 바뀌거나 초기 로드 후 실행
  useEffect(() => {
    const now = new Date().toISOString();
    const overdue = state.todos.filter(
      (t) => !t.isDone && (!t.date || t.date < today)
    );
    if (overdue.length === 0) return;

    dispatch({ type: ACTIONS.ROLLOVER, today });

    // 저장소에도 반영 (병렬)
    overdue.forEach((t) => {
      repo.update(t.id, { date: today, updatedAt: now }).catch(console.error);
    });
  }, [today, state.todos, repo]);

  // ── 액션 함수들 ──

  const addTodo = useCallback(
    async (draft) => {
      const todo = createTodo(draft);
      dispatch({ type: ACTIONS.ADD, payload: todo });
      try {
        await repo.add(todo);
      } catch (err) {
        console.error('[addTodo]', err);
        // 롤백
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

      // 반복 완료 시 다음 회차 생성
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
      addTodo,
      editTodo,
      toggleTodo,
      deleteTodo,
      setFilter,
      setCategory,
      setSort,
    }),
    [state, today, addTodo, editTodo, toggleTodo, deleteTodo, setFilter, setCategory, setSort]
  );

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodos must be used within <TodoProvider>');
  return ctx;
}
