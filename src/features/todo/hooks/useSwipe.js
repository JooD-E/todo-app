// features/todo/hooks/useSwipe.js
// TodoItem에 뒤섞여 있던 스와이프 로직을 분리합니다.
// 마우스/터치 공통 처리, 편집 중에는 비활성화.

import { useState, useCallback } from 'react';

export function useSwipe({ maxSwipe = -160, threshold = -40, disabled = false } = {}) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const getX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const onStart = useCallback(
    (e) => {
      if (disabled) return;
      setIsDragging(true);
      setStartX(getX(e) - translateX);
    },
    [disabled, translateX]
  );

  const onMove = useCallback(
    (e) => {
      if (!isDragging || disabled) return;
      let next = getX(e) - startX;
      if (next > 0) next = 0;
      if (next < maxSwipe - 20) next = maxSwipe - 20;
      setTranslateX(next);
    },
    [isDragging, disabled, startX, maxSwipe]
  );

  const onEnd = useCallback(() => {
    if (disabled) return;
    setIsDragging(false);
    setTranslateX(translateX < threshold ? maxSwipe : 0);
  }, [disabled, translateX, threshold, maxSwipe]);

  const onLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setTranslateX(0);
    }
  }, [isDragging]);

  const reset = useCallback(() => setTranslateX(0), []);

  return {
    translateX,
    isDragging,
    reset,
    handlers: {
      onMouseDown: onStart,
      onMouseMove: onMove,
      onMouseUp: onEnd,
      onMouseLeave: onLeave,
      onTouchStart: onStart,
      onTouchMove: onMove,
      onTouchEnd: onEnd,
    },
  };
}
