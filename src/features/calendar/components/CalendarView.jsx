// features/calendar/components/CalendarView.jsx
// nav 달력 화면. 월간 그리드 + todo가 있는 날짜 표시 + 날짜 클릭 시 해당일 목록.

import React, { useMemo, useState } from 'react';
import { useTodos } from '../../todo/store/TodoContext';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function toKey(year, month, day) {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function buildMonth(year, month) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function CalendarView() {
  const { allTodos } = useTodos();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(toKey(today.getFullYear(), today.getMonth(), today.getDate()));

  // 날짜별 todo 개수
  const countByDate = useMemo(() => {
    const map = {};
    allTodos.forEach((t) => {
      if (t.date) map[t.date] = (map[t.date] || 0) + 1;
    });
    return map;
  }, [allTodos]);

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate());

  const move = (delta) => {
    setCursor((c) => {
      const m = c.month + delta;
      if (m < 0) return { year: c.year - 1, month: 11 };
      if (m > 11) return { year: c.year + 1, month: 0 };
      return { ...c, month: m };
    });
  };

  const selectedTodos = allTodos.filter((t) => t.date === selected);

  return (
    <div className="app-content">
      <div className="calendar-header">
        <button onClick={() => move(-1)} aria-label="이전 달">‹</button>
        <span>{cursor.year}년 {cursor.month + 1}월</span>
        <button onClick={() => move(1)} aria-label="다음 달">›</button>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="calendar-cell empty" />;
          const key = toKey(cursor.year, cursor.month, day);
          const has = countByDate[key];
          return (
            <button
              key={key}
              className={`calendar-cell ${key === todayKey ? 'today' : ''} ${key === selected ? 'selected' : ''}`}
              onClick={() => setSelected(key)}
            >
              {day}
              {has && <span className="calendar-dot" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-daylist">
        <h4>{selected} 할 일</h4>
        {selectedTodos.length === 0 ? (
          <p className="calendar-empty">이 날짜에 등록된 할 일이 없습니다.</p>
        ) : (
          <ul>
            {selectedTodos.map((t) => (
              <li key={t.id} className={t.isDone ? 'done-text' : ''}>
                {t.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CalendarView;
