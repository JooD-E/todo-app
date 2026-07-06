// shared/ui/Checkbox.jsx
// 기존 check-circle div(키보드 접근 불가)를 접근성 있는 button으로 교체.

import React from 'react';

function Checkbox({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? '완료 해제' : '완료 처리'}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.();
      }}
      className="check-circle"
      style={{
        width: 20,
        height: 20,
        border: '2px solid #ccc',
        borderRadius: '50%',
        marginRight: 10,
        flexShrink: 0,
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: checked ? '#9F7AEA' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: 12,
        padding: 0,
      }}
    >
      {checked ? '✓' : ''}
    </button>
  );
}

export default Checkbox;
