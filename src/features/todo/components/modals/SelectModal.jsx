// features/todo/components/modals/SelectModal.jsx
// 카테고리·우선순위 등 "여러 옵션 중 하나 선택"용 범용 모달.
// 팝오버가 sheet-options의 overflow에 잘리는 문제를 근본 해결.

import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/ui/Modal';
import PriorityBars from '../../../../shared/ui/PriorityBars';

function SelectModal({ isOpen, onClose, title, options = [], selectedValue, onConfirm }) {
  const [value, setValue] = useState(selectedValue);

  // 모달이 열릴 때마다 최신 selectedValue로 초기화
  useEffect(() => {
    if (isOpen) setValue(selectedValue);
  }, [isOpen, selectedValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={() => onConfirm(value)}
    >
      <ul className="select-modal-list">
        {options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              className={`select-modal-item ${value === o.value ? 'active' : ''}`}
              onClick={() => setValue(value === o.value ? null : o.value)}
            >
              {o.icon && <span className="select-modal-emoji">{o.icon}</span>}
              {typeof o.bars === 'number' && <PriorityBars count={o.bars} />}
              <span className="select-modal-label">{o.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

export default SelectModal;
