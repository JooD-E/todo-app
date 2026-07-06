export const PRIORITY = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// 화면에 그릴 때 순서/라벨/색을 함께 정의 (OptionButton, Badge에서 map 하여 사용)
export const PRIORITY_OPTIONS = [
  { value: PRIORITY.HIGH, label: '1순위', bars: 3 },
  { value: PRIORITY.MEDIUM, label: '2순위', bars: 2 },
  { value: PRIORITY.LOW, label: '3순위', bars: 1 },
  { value: PRIORITY.NONE, label: '우선 순위 없음', bars: 0 },
];

// 우선순위 정렬용 가중치 (숫자가 클수록 위로)
export const PRIORITY_WEIGHT = {
  [PRIORITY.HIGH]: 3,
  [PRIORITY.MEDIUM]: 2,
  [PRIORITY.LOW]: 1,
  [PRIORITY.NONE]: 0,
};

export const CATEGORY_OPTIONS = [
  { value: 'work', label: '업무', icon: '💼' },
  { value: 'study', label: '공부', icon: '📚' },
  { value: 'health', label: '건강', icon: '🏋️' },
  { value: 'life', label: '생활', icon: '🏠' },
  { value: 'etc', label: '기타', icon: '📌' },
];

export const FILTER = {
  ALL: 'all',
  ACTIVE: 'active', // 미완료
  DONE: 'done',
};

export const SORT = {
  CREATED: 'created', // 등록순
  DATE: 'date', // 마감일순
  PRIORITY: 'priority', // 우선순위순
  MANUAL: 'manual', // 사용자 드래그 순서(order)
};

// ── 반복(repeat) 옵션 ──
export const REPEAT_TYPE = { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly' };

export const REPEAT_OPTIONS = [
  { value: REPEAT_TYPE.DAILY, label: '매일' },
  { value: REPEAT_TYPE.WEEKLY, label: '매주' },
  { value: REPEAT_TYPE.MONTHLY, label: '매월' },
];

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** repeat 객체 → 사람이 읽는 문자열 */
export function formatRepeat(repeat) {
  if (!repeat) return '';
  if (repeat.type === REPEAT_TYPE.DAILY) return '매일';
  if (repeat.type === REPEAT_TYPE.MONTHLY) return '매월';
  if (repeat.type === REPEAT_TYPE.WEEKLY) {
    const days = repeat.weekdays ?? [];
    if (days.length === 0) return '매주';
    if (days.length === 7) return '매일';
    return `매주 ${days.map((d) => WEEKDAY_LABELS[d]).join('·')}`;
  }
  return '';
}

/** 'HH:mm' → { hour12, minute, period } */
export function parseTime24(hhmm) {
  if (!hhmm) return { hour12: 9, minute: 0, period: 'AM' };
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { hour12, minute: m, period };
}

/** { hour12, minute, period } → 'HH:mm' */
export function formatTime24(hour12, minute, period) {
  let h = hour12 % 12;
  if (period === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * 반복 규칙에 따라 다음 발생 날짜 계산
 * @param {string} currentDateStr - 'YYYY-MM-DD'
 * @param {object} repeat - { type, weekdays? }
 * @returns {string|null} 다음 날짜 'YYYY-MM-DD' 또는 null
 */

export function nextRepeatDate(currentDateStr, repaet) {
  if (!currentDateStr || !repeat || !repeat.type) return null;

  const [y,m,d] = currentDateStr.split('-').map(Number);
  const current = new Date(y, m -1, d);

  const toStr = (date) => {
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };

  switch (repeat.type) {
    case REPEAT_TYPE.DAILY: {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      return toStr(next);
    }
    case REPEAT_TYPE.WEEKLY: {
      const weekdays = repeat.weekdats || [];
      if (weekdays.length === 0) return null;
      const currentDay = current.getDay();
      const sorted = [...weekdays].sort((a, b) => a-b);
      const nextDay = sorted.find((day) => day > currentDay);
      const daysToAdd = nextDay !== undefined
        ? nextDay - currentDay
        : 7 - currentDay + sorted[0];
      const next = new Date(current);
      next.setDate(next.getDate() + daysToAdd);
      return toStr(next);
    }
    case REPEAT_TYPE.MONTHLY: {
      const orginalDay = current.getDate();
      const next = new Date(current);
      next.setMonth(next.getMonth() +1);

      if(next.getDate() !== originalDay) {
        next.setDate(0);
      }
      return toStr(next);
    }
    default:
      return null;
  }
}