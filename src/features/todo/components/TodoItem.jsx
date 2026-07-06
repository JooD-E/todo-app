// features/todo/components/TodoItem.jsx
// 카드 본체(todo-front) 클릭 → 상세 화면 이동.
// 단, translateX가 0이 아니거나 드래그 중이면 무시(스와이프 후 오작동 방지).

import React from 'react';
import { useSwipe } from '../hooks/useSwipe';
import Checkbox from '../../../shared/ui/Checkbox';
import Icon from '../../../shared/ui/Icon';
import Badge from '../../../shared/ui/Badge';
import PriorityBars from '../../../shared/ui/PriorityBars';
import { PRIORITY_OPTIONS } from '../constants';

function TodoItem({ todo, onToggle, onEdit, onDelete, onOpenDetail }) {
  const { translateX, isDragging, reset, handlers } = useSwipe();

  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === todo.priority);
  const subtaskTotal = todo.subtasks?.length ?? 0;
  const hasTime = Boolean(todo.time);

  const handleEditClick = (e) => {
    e.stopPropagation();
    reset();
    onEdit(todo);
  };

  const handleCardClick = () => {
    // 스와이프 상태에서는 클릭 무시
    if (isDragging || translateX !== 0) return;
    onOpenDetail?.(todo);
  };

  return (
    <div className="todo-item-wrapper">
      <div className="todo-actions">
        <button
          className="action-btn edit-btn"
          onClick={handleEditClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          수정 <span><img src="/assets/edit.png" alt="수정" /></span>
        </button>
        <button
          className="action-btn delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          삭제 <span><img src="/assets/eraser.png" alt="삭제" /></span>
        </button>
      </div>

      <div
        className={`todo-front ${todo.isDone ? 'done' : ''}`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          cursor: 'pointer',
        }}
        onClick={handleCardClick}
        {...handlers}
      >
        <div className="todo-content">
          <Checkbox
            checked={todo.isDone}
            onChange={() => onToggle(todo.id)}
          />

          <div className="todo-main">
            <div className="todo-title-row">
              <span className="todo-text">{todo.text}</span>
              {subtaskTotal > 0 && (
                <Icon
                  name="sub"
                  alt={`하위 작업 ${subtaskTotal}개`}
                  className="todo-subtask-icon"
                />
              )}
            </div>
            {hasTime && (
              <div className="todo-badges">
                <Badge>🕐 {todo.time}</Badge>
              </div>
            )}
          </div>

          {priorityMeta && <PriorityBars count={priorityMeta.bars} />}
        </div>
      </div>
    </div>
  );
}

export default TodoItem;
