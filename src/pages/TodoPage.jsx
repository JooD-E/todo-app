// pages/TodoPage.jsx
// 화면 조립 담당. 데이터/상태는 useTodos 훅에서, UI는 컴포넌트에서.

import React, { useState } from 'react';
import Header from '../shared/layout/Header';
import Navigation from '../shared/layout/Navigation';
import { useTodos } from '../features/todo/hooks/useTodos';
import TodoList from '../features/todo/components/TodoList';
import BottomSheet from '../features/todo/components/BottomSheet';
import NotificationPanel from '../features/notification/components/NotificationPanel';

function TodoPage() {
  const { todos, addTodo, editTodo, toggleTodo, deleteTodo } = useTodos();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  return (
    <div className="phone-wrapper">
      <Header />

      <TodoList
        todos={todos}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
      />

      <button className="fab-btn" onClick={() => setIsSheetOpen(true)}>
        +
      </button>

      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onAddTodo={addTodo}
      />

      <Navigation onOpenNoti={() => setIsNotiOpen(true)} />

      <NotificationPanel isOpen={isNotiOpen} onClose={() => setIsNotiOpen(false)} />
    </div>
  );
}

export default TodoPage;
