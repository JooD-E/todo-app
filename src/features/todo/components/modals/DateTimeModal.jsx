// features/todo/components/modals/DateTimeModal.jsx
// 와이어프레임의 "날짜 버튼 클릭" 화면 대응.
// 브라우저 네이티브 date input + 시/분/AM·PM 세 개 select 조합.
// (와이어프레임의 스크롤 휠 UX는 라이브러리 없이 재현하면 무거우니 실용적 폼으로)

import React, { useState } from 'react';
import Modal from '../../../../shared/ui/Modal';
import { parseTime24, formatTime24 } from '../../constants';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59

function DateTimeModal({ isOpen, onClose, initialDate, initialTime, onConfirm }) {
  const [date, setDate] = useState(initialDate ?? '');
  const [enableTime, setEnableTime] = useState(Boolean(initialTime));
  const initial = parseTime24(initialTime);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  const handleConfirm = () => {
    onConfirm({
      date: date || null,
      time: enableTime ? formatTime24(hour12, minute, period) : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="날짜 · 시간" onConfirm={handleConfirm}>
      <label className="modal-field">
        <span>날짜</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label className="modal-check">
        <input
          type="checkbox"
          checked={enableTime}
          onChange={(e) => setEnableTime(e.target.checked)}
        />
        <span>시간 설정</span>
      </label>

      {enableTime && (
        <div className="time-picker">
          <select value={hour12} onChange={(e) => setHour12(Number(e.target.value))}>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}
              </option>
            ))}
          </select>
          <span>:</span>
          <select value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      )}
    </Modal>
  );
}

export default DateTimeModal;
