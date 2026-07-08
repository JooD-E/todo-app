// features/activity/components/ActivityLogView.jsx
// 시간 역순 그룹핑 (오늘/어제/그 외) + 액션 아이콘 + 시간.
// 게스트/미로그인: LockedOverlay로 게이팅.

import React from 'react';
import { useActivityLog } from '../store/ActivityLogContext';
import LockedOverlay from '../../../shared/ui/LockedOverlay';

const TYPE_META = {
  ADD: { icon: '➕', label: '추가함' },
  EDIT: { icon: '✏️', label: '수정함' },
  COMPLETE: { icon: '✅', label: '완료함' },
  UNCOMPLETE: { icon: '⏪', label: '완료 취소함' },
  DELETE: { icon: '🗑️', label: '삭제함' },
  REPEAT_CREATED: { icon: '🔁', label: '반복 회차 생성됨' },
};

function groupByDay(logs) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86_400_000).toDateString();
  const groups = {};
  const order = [];

  logs.forEach((log) => {
    const d = new Date(log.createdAt).toDateString();
    let label;
    if (d === today) label = '오늘';
    else if (d === yesterday) label = '어제';
    else {
      label = new Date(log.createdAt).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });
    }
    if (!(label in groups)) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(log);
  });

  return order.map((label) => [label, groups[label]]);
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ActivityLogView() {
  const { logs, isLoading, clearAllLogs } = useActivityLog();

  return (
    <LockedOverlay
      message="활동 내역은 로그인 후 확인할 수 있어요"
      hint="시간순 활동 기록이 계정별로 저장돼요."
    >
      <div className="app-content activity-view">
        <div className="activity-header">
          <h2 className="activity-title">활동 내역</h2>
          {logs.length > 0 && (
            <button
              type="button"
              className="activity-clear-btn"
              onClick={() => {
                if (window.confirm('모든 활동 내역을 삭제할까요?')) {
                  clearAllLogs();
                }
              }}
            >
              모두 지우기
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="activity-empty">
            <p>불러오는 중...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="activity-empty">
            <p style={{ fontSize: 40 }}>📜</p>
            <p>아직 활동이 없어요.</p>
            <p style={{ fontSize: 13 }}>할 일을 추가하거나 완료해보세요.</p>
          </div>
        ) : (
          groupByDay(logs).map(([day, list]) => (
            <div className="activity-group" key={day}>
              <h3 className="activity-day">{day}</h3>
              <ul className="activity-list">
                {list.map((log) => {
                  const meta = TYPE_META[log.type] || { icon: '•', label: '변경됨' };
                  return (
                    <li key={log.id} className="activity-item">
                      <span className="activity-icon">{meta.icon}</span>
                      <span className="activity-text">
                        <strong>'{log.todoText}'</strong> {meta.label}
                      </span>
                      <span className="activity-time">{formatTime(log.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </LockedOverlay>
  );
}

export default ActivityLogView;
