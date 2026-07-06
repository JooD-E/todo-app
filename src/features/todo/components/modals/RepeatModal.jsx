// features/todo/components/modals/RepeatModal.jsx
// 와이어프레임의 "반복작업 버튼 클릭" 화면 대응.
// 매일/매주/매월 중 선택, 매주면 요일 다중선택 노출.

import React, { useState } from 'react';
import Modal from '../../../../shared/ui/Modal';
import { REPEAT_OPTIONS, REPEAT_TYPE, WEEKDAY_LABELS } from '../../constants';

function RepeatModal({ isOpen, onClose, initialRepeat, onConfirm }) {
  const [type, setType] = useState(initialRepeat?.type ?? null);
  const [weekdays, setWeekdays] = useState(initialRepeat?.weekdays ?? []);

  const toggleWeekday = (d) => {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleConfirm = () => {
    if (!type) return onConfirm(null); // 반복 없음
    if (type === REPEAT_TYPE.WEEKLY) return onConfirm({ type, weekdays });
    onConfirm({ type });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="반복 설정" onConfirm={handleConfirm}>
      <div className="repeat-type-row">
        <button
          type="button"
          className={`repeat-chip ${type === null ? 'active' : ''}`}
          onClick={() => setType(null)}
        >
          반복 없음
        </button>
        {REPEAT_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`repeat-chip ${type === o.value ? 'active' : ''}`}
            onClick={() => setType(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {type === REPEAT_TYPE.WEEKLY && (
        <div className="weekday-row">
          {WEEKDAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              className={`weekday-chip ${weekdays.includes(i) ? 'active' : ''}`}
              onClick={() => toggleWeekday(i)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default RepeatModal;
