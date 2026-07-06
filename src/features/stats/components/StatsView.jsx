// features/stats/components/StatsView.jsx
// 성취 통계: 오늘/이번주/이번달/전체 완료율 카드 + 최근 7일 막대 + 카테고리별.

import React, { useMemo } from 'react';
import { useTodos } from '../../todo/store/TodoContext';
import { CATEGORY_OPTIONS } from '../../todo/constants';
import LockedOverlay from '../../../shared/ui/LockedOverlay';

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcRate(todos) {
  if (todos.length === 0) return { total: 0, done: 0, percent: 0 };
  const done = todos.filter((t) => t.isDone).length;
  return { total: todos.length, done, percent: Math.round((done / todos.length) * 100) };
}

function StatsCard({ label, done, total, percent }) {
  return (
    <div className="stats-card">
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-percent">{percent}%</div>
      <div className="stats-card-count">{done}/{total}</div>
    </div>
  );
}

function StatsView() {
  const { allTodos } = useTodos();

  const stats = useMemo(() => {
    const now = new Date();
    const today = toDateStr(now);

    // 이번 주 시작 (월요일)
    const dow = now.getDay(); // 0=일 ~ 6=토
    const daysToMon = (dow + 6) % 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMon);
    const weekStartStr = toDateStr(weekStart);

    // 이번 달 시작
    const monthStartStr = today.slice(0, 7) + '-01';

    const todayTodos = allTodos.filter((t) => t.date === today);
    const weekTodos = allTodos.filter((t) => t.date >= weekStartStr && t.date <= today);
    const monthTodos = allTodos.filter((t) => t.date >= monthStartStr && t.date <= today);

    // 최근 7일 (과거 6일 + 오늘)
    const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const s = toDateStr(d);
      const dayTodos = allTodos.filter((t) => t.date === s);
      last7Days.push({
        date: s,
        label: WEEKDAY[d.getDay()],
        total: dayTodos.length,
        done: dayTodos.filter((t) => t.isDone).length,
      });
    }

    // 카테고리별
    const byCategory = CATEGORY_OPTIONS
      .map((c) => ({
        ...c,
        ...calcRate(allTodos.filter((t) => t.category === c.value)),
      }))
      .filter((c) => c.total > 0);

    return {
      overall: calcRate(allTodos),
      today: calcRate(todayTodos),
      week: calcRate(weekTodos),
      month: calcRate(monthTodos),
      last7Days,
      byCategory,
    };
  }, [allTodos]);

  const maxDailyDone = Math.max(1, ...stats.last7Days.map((d) => d.done));

  return (
    <LockedOverlay
      message="성취 통게는 로그인 후 확인할 수 있어요"
      hint="꾸준한 기록을 보려면 계정이 필요해요."
    >
      <div className="app-content stats-view">
        <h2 className="stats-title">성취 통계</h2>

        <div className="stats-cards">
          <StatsCard label="오늘" {...stats.today} />
          <StatsCard label="이번 주" {...stats.week} />
          <StatsCard label="이번 달" {...stats.month} />
          <StatsCard label="전체" {...stats.overall} />
        </div>

        <section className="stats-section">
          <h3 className="stats-section-title">최근 7일 완료</h3>
          <div className="stats-week-chart">
            {stats.last7Days.map((d) => (
              <div key={d.date} className="stats-week-col">
                <div className="stats-week-bar-wrap">
                  <div
                    className="stats-week-bar"
                    style={{ height: `${(d.done / maxDailyDone) * 100}%` }}
                    title={`${d.done}/${d.total}`}
                  />
                </div>
                <div className="stats-week-count">{d.done}</div>
                <div className="stats-week-label">{d.label}</div>
              </div>
            ))}
          </div>
        </section>

        {stats.byCategory.length > 0 && (
          <section className="stats-section">
            <h3 className="stats-section-title">카테고리별</h3>
            <ul className="stats-cat-list">
              {stats.byCategory.map((c) => (
                <li key={c.value} className="stats-cat-item">
                  <span className="stats-cat-emoji">{c.icon}</span>
                  <span className="stats-cat-name">{c.label}</span>
                  <div className="stats-cat-bar-wrap">
                    <div className="stats-cat-bar" style={{ width: `${c.percent}%` }} />
                  </div>
                  <span className="stats-cat-count">{c.done}/{c.total}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {allTodos.length === 0 && (
          <div className="stats-empty">
            <p style={{ fontSize: 40 }}>📊</p>
            <p>아직 통계를 볼 데이터가 없어요.</p>
            <p style={{ fontSize: 13 }}>할 일을 추가하고 완료해보세요.</p>
          </div>
        )}
      </div>
    </LockedOverlay>
  );
}

export default StatsView;
