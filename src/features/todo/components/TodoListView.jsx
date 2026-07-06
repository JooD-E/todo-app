// features/todo/components/TodoListView.jsx
// 메인화면: 오늘 진행률 바 + 오늘/날짜없음 todo만 표시.

import React, { useEffect, useMemo, useState } from 'react';
import TodoList from './TodoList';
import { useTodos } from '../store/TodoContext';
import { CATEGORY_OPTIONS } from '../constants';

/** 'YYYY-MM-DD' 오늘 문자열 */
function useTodayString() {
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date().toISOString().slice(0, 10);
      setToday((prev) => (prev !== now ? now : prev));
    }, 60_000);
    return () => clearInterval(t);
  }, []);
  return today;
}

function TodoListView({ onOpenAddSheet, onOpenEditSheet, onOpenDetail }) {
  const { todos, category, setCategory, toggleTodo, editTodo, deleteTodo } = useTodos();
  const today = useTodayString();
  const categoryMeta = CATEGORY_OPTIONS.find((c) => c.value === category);

  // 메인화면 노출 대상: 오늘 마감 + 날짜 미지정
  const visibleTodos = useMemo(
    () => todos.filter((t) => !t.date || t.date === today),
    [todos, today]
  );

  // 진행률: 화면에 보이는 것 기준
  const total = visibleTodos.length;
  const done = visibleTodos.filter((t) => t.isDone).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <>
      <div className="today-progress">
        <div className="today-progress-label">
          <span>오늘의 할 일</span>
          <span>
            <span className="count">{done}/{total}</span>{' '}
            <span className="percent">{percent}%</span>
          </span>
        </div>
        <div className="today-progress-bar">
          <div className="today-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {categoryMeta && (
        <div className="active-filter-bar">
          <span className="active-filter-chip">
            {categoryMeta.icon} {categoryMeta.label}
            <button onClick={() => setCategory(null)} aria-label="필터 해제">
              ✕
            </button>
          </span>
        </div>
      )}

      <TodoList
        todos={visibleTodos}
        onToggle={toggleTodo}
        onEdit={onOpenEditSheet}
        onDelete={deleteTodo}
        onOpenDetail={onOpenDetail}
      />

      <button className="fab-btn" onClick={onOpenAddSheet} aria-label="할 일 추가">
        +
      </button>
    </>
  );
}

export default TodoListView;
