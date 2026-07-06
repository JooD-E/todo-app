import React, { useEffect, useState } from 'react';
import { useTodos } from '../store/TodoContext';
import Checkbox from '../../../shared/ui/Checkbox';
import SelectModal from './modals/SelectModal';
import DateTimeModal from './modals/DateTimeModal';
import RepeatModal from './modals/RepeatModal';
import SubtaskModal from './modals/SubtaskModal';
import NotesModal from './modals/NotesModal';
import { CATEGORY_OPTIONS, formatRepeat } from '../constants';

function DetailRow({ icon, label, value, muted, onClick }) {
  return (
    <button className="detail-row" onClick={onClick} type="button">
      <span className="detail-row-icon">{icon}</span>
      <span className="detail-row-label">{label}</span>
      <span className={`detail-row-value ${muted ? 'muted' : ''}`}>{value}</span>
    </button>
  );
}

function TodoDetailView({ todo, onBack }) {
  const { editTodo, deleteTodo, toggleTodo } = useTodos();

  const [openModal, setOpenModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const [textValue, setTextValue] = useState(todo.text);

  useEffect(() => setTextValue(todo.text), [todo.text]);

  const update = (patch) => editTodo(todo.id, patch);

  const commitText = () => {
    const next = textValue.trim();
    if (next && next !== todo.text) update({ text: next });
    else setTextValue(todo.text);
    setEditingText(false);
  };

  const toggleSubtask = (subtaskId) => {
    const newSubtasks = (todo.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, isDone: !s.isDone } : s
    );
    update({ subtasks: newSubtasks });
  };

  const handleComplete = () => {
    toggleTodo(todo.id);
    setMenuOpen(false);
    onBack();
  };

  const handleDelete = () => {
    deleteTodo(todo.id);
    setMenuOpen(false);
    onBack();
  };

  const categoryMeta = CATEGORY_OPTIONS.find((c) => c.value === todo.category);

  return (
    <div className="detail-view">
      <header className="detail-header">
        <button className="detail-icon-btn" onClick={onBack} aria-label="뒤로">
          ←
        </button>
        <div style={{ position: 'relative' }}>
          <button
            className="detail-icon-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="더보기"
          >
            ⋮
          </button>
          {menuOpen && (
            <>
              <div className="detail-menu-scrim" onClick={() => setMenuOpen(false)} />
              <div className="detail-menu">
                <button onClick={handleComplete}>
                  {todo.isDone ? '완료 해제' : '완료 처리'}
                </button>
                <button onClick={handleDelete} className="danger">
                  삭제
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="detail-content">
        <button
          type="button"
          className={`detail-category-pill ${categoryMeta ? 'active' : ''}`}
          onClick={() => setOpenModal('category')}
        >
          {categoryMeta ? `${categoryMeta.icon} ${categoryMeta.label}` : '카테고리 없음'}
          <span className="detail-caret">▾</span>
        </button>

        {editingText ? (
          <input
            className="detail-title-input"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitText();
              if (e.key === 'Escape') {
                setTextValue(todo.text);
                setEditingText(false);
              }
            }}
            autoFocus
          />
        ) : (
          <h1
            className={`detail-title ${todo.isDone ? 'done' : ''}`}
            onClick={() => setEditingText(true)}
            title="클릭하여 수정"
          >
            {todo.text}
          </h1>
        )}

        <div className="detail-subtasks">
          {todo.subtasks && todo.subtasks.length > 0 && (
            <ul>
              {todo.subtasks.map((s) => (
                <li key={s.id}>
                  <Checkbox checked={s.isDone} onChange={() => toggleSubtask(s.id)} />
                  <span className={s.isDone ? 'done-text' : ''}>{s.text}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="detail-add-subtask"
            onClick={() => setOpenModal('subtask')}
          >
            + 하위 작업 추가
          </button>
        </div>

        <div className="detail-rows">
          <DetailRow
            icon="🕐"
            label="시간 & 알림"
            value={todo.time || '아니요'}
            muted={!todo.time}
            onClick={() => setOpenModal('datetime')}
          />
          <DetailRow
            icon="🔁"
            label="반복 작업"
            value={todo.repeat ? formatRepeat(todo.repeat) : '아니요'}
            muted={!todo.repeat}
            onClick={() => setOpenModal('repeat')}
          />
          <DetailRow
            icon="💬"
            label="메모"
            value={todo.notes ? todo.notes : '추가'}
            muted={!todo.notes}
            onClick={() => setOpenModal('notes')}
          />
        </div>
      </div>

      <SelectModal
        isOpen={openModal === 'category'}
        onClose={() => setOpenModal(null)}
        title="카테고리"
        options={CATEGORY_OPTIONS}
        selectedValue={todo.category}
        onConfirm={(v) => update({ category: v })}
      />
      <DateTimeModal
        isOpen={openModal === 'datetime'}
        onClose={() => setOpenModal(null)}
        initialDate={todo.date}
        initialTime={todo.time}
        onConfirm={({ date, time }) => update({ date, time })}
      />
      <RepeatModal
        isOpen={openModal === 'repeat'}
        onClose={() => setOpenModal(null)}
        initialRepeat={todo.repeat}
        onConfirm={(repeat) => update({ repeat })}
      />
      <SubtaskModal
        isOpen={openModal === 'subtask'}
        onClose={() => setOpenModal(null)}
        initialSubtasks={todo.subtasks || []}
        onConfirm={(subtasks) => update({ subtasks })}
      />
      <NotesModal
        isOpen={openModal === 'notes'}
        onClose={() => setOpenModal(null)}
        initialNotes={todo.notes || ''}
        onConfirm={(notes) => update({ notes })}
      />
    </div>
  );
}

export default TodoDetailView;
