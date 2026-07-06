// shared/ui/PriorityBars.jsx
// 우선순위를 세로 막대 n개로 표시. TodoItem, OptionButton 팝오버에서 공용.

import React from 'react';

function PriorityBars({ count = 0 }) {
  if (count <= 0) return null;
  return (
    <span className="priority-bars" aria-label={`${count}순위`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="priority-bar" />
      ))}
    </span>
  );
}

export default PriorityBars;
