// features/todo/components/modals/NotesModal.jsx
// 메모 입력용 모달. textarea만 있는 심플 구조.

import React, { useEffect, useState } from 'react';
import Modal from '../../../../shared/ui/Modal';

function NotesModal({ isOpen, onClose, initialNotes = '', onConfirm }) {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    if (isOpen) setNotes(initialNotes);
  }, [isOpen, initialNotes]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="메모"
      onConfirm={() => onConfirm(notes.trim())}
    >
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="메모를 입력하세요"
        autoFocus
        rows={6}
      />
    </Modal>
  );
}

export default NotesModal;
