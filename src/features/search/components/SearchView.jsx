// features/search/components/SearchView.jsx
// nav 검색·활동 화면. 검색어 + 진행중/완료 탭 + 진행률 링.
// 전역 상태를 건드리지 않도록 자체 로컬 필터를 사용합니다.

import React, { useMemo, useState } from 'react';
import { useTodos } from '../../todo/store/TodoContext';
import { selectProgress } from '../../todo/store/todoReducer';

const TABS = [
  { value: 'active', label: '진행중' },
  { value: 'done', label: '완료' },
];

function ProgressRing({ percent }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-color)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--primary-color)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="progress-text">
        {percent}%
      </text>
    </svg>
  );
}

function SearchView() {
  const { allTodos } = useTodos();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('active');

  const progress = useMemo(() => selectProgress(allTodos), [allTodos]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTodos.filter((t) => {
      if (tab === 'active' && t.isDone) return false;
      if (tab === 'done' && !t.isDone) return false;
      if (q && !t.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allTodos, query, tab]);

  return (
    <div className="app-content">
      <div className="search-box">
        <input
          type="text"
          placeholder="할 일 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="search-tabs">
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`search-tab ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="search-results">
        {results.length === 0 && <li className="search-empty">결과가 없습니다.</li>}
        {results.map((t) => (
          <li key={t.id} className="search-result-item">
            <span className={t.isDone ? 'done-text' : ''}>{t.text}</span>
            {t.date && <span className="search-date">{t.date}</span>}
          </li>
        ))}
      </ul>
      
      <LockedOverlay
        message="이번 달 달성률은 로그인 후 확인할 수 있어요"
        compact
      >
        <div className="progress-section">
          <h4 className="progress-label">이번 달 달성률</h4>
          <ProgressRing percent={progress} />
        </div>
      </LockedOverlay>
    </div>
  );
}

export default SearchView;
