// features/todo/components/modals/SubtaskModal.jsx
// 와이어프레임의 "하위작업 버튼 클릭" 화면 대응.
// 엔터 or "추가" 버튼으로 여러 개 등록, 각 항목 삭제 가능.

import React, { useState } from 'react';
import Modal from '../../../../shared/ui/Modal';
import { createSubtask } from '../../todoModel';

function SubtaskModal({ isOpen, onClose, initialSubtasks = [], onConfirm }) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [input, setInput] = useState('');

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setSubtasks((prev) => [...prev, createSubtask(text)]);
    setInput('');
  };

  const remove = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="하위 작업"
      onConfirm={() => onConfirm(subtasks)}
    >
      <div className="subtask-input-row">
        <input
          type="text"
          value={input}
          placeholder="하위 작업 입력"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" className="modal-btn primary sm" onClick={add}>
          추가
        </button>
      </div>

      <ul className="subtask-list">
        {subtasks.length === 0 && <li className="subtask-empty">아직 하위 작업이 없습니다.</li>}
        {subtasks.map((s) => (
          <li key={s.id} className="subtask-list-item">
            <span>• {s.text}</span>
            <button type="button" onClick={() => remove(s.id)} aria-label="삭제">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default SubtaskModal;
