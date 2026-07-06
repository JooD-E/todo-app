// features/todo/components/TodoList.jsx
// framer-motion의 layout으로 카드 재배치 애니메이션.
// - 체크로 완료 → 카드가 아래로 슬라이드, 다른 카드가 위로 슬라이드
// - 삭제 → 카드가 페이드 아웃 + 높이 축소
// - 새 카드 → 위에서 슬며시 등장

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from './TodoItem';

function TodoList({ todos, onToggle, onEdit, onDelete, onOpenDetail }) {
  if (todos.length === 0) {
    return (
      <div className="app-content">
        <div style={{ textAlign: 'center', color: '#aaa', marginTop: 80 }}>
          <p style={{ fontSize: 40 }}>📝</p>
          <p>할 일이 없습니다.</p>
          <p style={{ fontSize: 13 }}>+ 버튼을 눌러 추가해보세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <AnimatePresence initial={false}>
        {todos.map((todo) => (
          <motion.div
            key={todo.id}
            layout        
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <TodoItem
              todo={todo}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenDetail={onOpenDetail}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TodoList;
