// shared/ui/Modal.jsx
// 바텀시트 위에 뜨는 옵션 모달들을 위한 공용 껍데기.

import React from 'react';

function Modal({ isOpen, onClose, title, children, onConfirm, confirmLabel = '설정 완료' }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-panel" role="dialog" aria-modal="true">
        {title && <h3 className="modal-title">{title}</h3>}
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onClose}>
            취소
          </button>
          {onConfirm && (
            <button
              className="modal-btn primary"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Modal;
