// shared/ui/Icon.jsx
// 다크모드에서 자동으로 -white 아이콘으로 스위칭.
// 화이트 버전이 없는 아이콘(edit, eraser, sendbtn 등)은 원본 그대로.
//
// 사용: <Icon name="hamburger" alt="메뉴" className="nav-icon" />

import React from 'react';
import { useTheme } from '../theme/ThemeContext';

// /public/assets 에 -white 버전이 존재하는 아이콘들
// 새 아이콘을 추가할 때 여기에만 등록하면 자동으로 다크모드 지원됩니다.
const ICONS_WITH_DARK = new Set([
  'bookmark',
  'calendar',
  'category',
  'chart',
  'check-calendar',
  'exercise',
  'hamburger',
  'history',
  'house',
  'moon',
  'notification',
  'pencil',
  'plus-category',
  'repeat',
  'search',
  'sub',
  'user',
]);

function Icon({ name, alt = '', ...rest }) {
  const { theme } = useTheme();
  const useDark = theme === 'dark' && ICONS_WITH_DARK.has(name);
  const src = `/assets/${name}${useDark ? '-white' : ''}.png`;
  return <img src={src} alt={alt} {...rest} />;
}

export default Icon;
