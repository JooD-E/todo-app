// features/todo/components/BottomSheet.jsx
// add 모드 + edit 모드 겸용. initialDraft가 있으면 그 값으로 초기화.

import React, { useEffect, useRef, useState } from 'react';
import Icon from '../../../shared/ui/Icon';
import DateTimeModal from './modals/DateTimeModal';
import SubtaskModal from './modals/SubtaskModal';
import RepeatModal from './modals/RepeatModal';
import SelectModal from './modals/SelectModal';
import {
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  formatRepeat,
} from '../constants';

const EMPTY_DRAFT = {
  text: '',
  date: null,
  time: null,
  priority: null,
  category: null,
  subtasks: [],
  repeat: null,
};

function toDraft(source) {
  if (!source) return EMPTY_DRAFT;
  return {
    text: source.text ?? '',
    date: source.date ?? null,
    time: source.time ?? null,
    priority: source.priority ?? null,
    category: source.category ?? null,
    subtasks: source.subtasks ?? [],
    repeat: source.repeat ?? null,
  };
}

function BottomSheet({ isOpen, onClose, mode = 'add', initialDraft, onAddTodo, onEditTodo }) {
  const scrollRef = useRef(null);
  const [isDrag, setIsDrag] = useState(false);
  const [startX, setStartX] = useState(0);

  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const [openModal, setOpenModal] = useState(null);

  // 시트가 열릴 때마다 초기화 (add=빈값, edit=기존값)
  useEffect(() => {
    if (isOpen) setDraft(toDraft(initialDraft));
  }, [isOpen, initialDraft]);

  const handleSubmit = () => {
    if (draft.text.trim() === '') return;
    
    const today = new Date().toISOString().slice(0, 10);
    const finalDraft = { ...draft, date: draft.date || today };
    if (mode === 'edit' && initialDraft?.id) {
      onEditTodo(initialDraft.id, finalDraft);
    } else {
      onAddTodo(finalDraft);
    }
    onClose();
  };

  const onDragStart = (e) => {
    setIsDrag(true);
    setStartX(e.pageX + scrollRef.current.scrollLeft);
  };
  const onDragEnd = () => setIsDrag(false);
  const onDragMove = (e) => {
    if (!isDrag) return;
    scrollRef.current.scrollLeft = startX - e.pageX;
  };

  if (!isOpen) return null;

  const categoryMeta = CATEGORY_OPTIONS.find((c) => c.value === draft.category);
  const priorityMeta = PRIORITY_OPTIONS.find((p) => p.value === draft.priority);
  const dateTimeLabel = draft.date
    ? `${draft.date}${draft.time ? ` ${draft.time}` : ''}`
    : draft.time || '날짜';
  const subtaskLabel = draft.subtasks.length > 0 ? `하위 ${draft.subtasks.length}개` : '하위 작업';
  const repeatLabel = draft.repeat ? formatRepeat(draft.repeat) : '반복 작업';

  const placeholder = mode === 'edit' ? '할 일을 수정하세요' : '할 일을 입력하세요';

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose}></div>

      <div className="bottom-sheet">
        <div className="input-container">
          <input
            type="text"
            placeholder={placeholder}
            autoFocus
            value={draft.text}
            onChange={(e) => setField('text', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className="send-btn" onClick={handleSubmit} aria-label={mode === 'edit' ? '수정 완료' : '추가'}>
            <Icon name="sendbtn" alt={mode === 'edit' ? '수정 완료' : '보내기'} />
          </button>
        </div>

        <div
          className="sheet-options"
          ref={scrollRef}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
        >

          <button
            type="button"
            className={`option-btn ${draft.date || draft.time ? 'active' : ''}`}
            onClick={() => setOpenModal('datetime')}
          >
            <Icon name="check-calendar" alt="날짜" />
            <span>{dateTimeLabel}</span>
          </button>


          <button
            type="button"
            className={`option-btn ${draft.category ? 'active' : ''}`}
            onClick={() => setOpenModal('category')}
          >
            <Icon name="category" alt="카테고리" />
            <span>{categoryMeta ? categoryMeta.label : '카테고리'}</span>
          </button>

          <button
            type="button"
            className={`option-btn ${draft.priority ? 'active' : ''}`}
            onClick={() => setOpenModal('priority')}
          >
            <Icon name="bookmark" alt="우선 순위" />
            <span>{priorityMeta ? priorityMeta.label : '우선 순위'}</span>
          </button>

          <button
            type="button"
            className={`option-btn ${draft.subtasks.length > 0 ? 'active' : ''}`}
            onClick={() => setOpenModal('subtask')}
          >
            <Icon name="sub" alt="하위 작업" />
            <span>{subtaskLabel}</span>
          </button>

          <button
            type="button"
            className={`option-btn ${draft.repeat ? 'active' : ''}`}
            onClick={() => setOpenModal('repeat')}
          >
            <Icon name="repeat" alt="반복" />
            <span>{repeatLabel}</span>
          </button>
        </div>
      </div>

      <SelectModal
        isOpen={openModal === 'category'}
        onClose={() => setOpenModal(null)}
        title="카테고리"
        options={CATEGORY_OPTIONS}
        selectedValue={draft.category}
        onConfirm={(v) => setField('category', v)}
      />

      <SelectModal
        isOpen={openModal === 'priority'}
        onClose={() => setOpenModal(null)}
        title="우선 순위"
        options={PRIORITY_OPTIONS}
        selectedValue={draft.priority}
        onConfirm={(v) => setField('priority', v)}
      />

      <DateTimeModal
        isOpen={openModal === 'datetime'}
        onClose={() => setOpenModal(null)}
        initialDate={draft.date}
        initialTime={draft.time}
        onConfirm={({ date, time }) => {
          setField('date', date);
          setField('time', time);
        }}
      />

      <SubtaskModal
        isOpen={openModal === 'subtask'}
        onClose={() => setOpenModal(null)}
        initialSubtasks={draft.subtasks}
        onConfirm={(subtasks) => setField('subtasks', subtasks)}
      />

      <RepeatModal
        isOpen={openModal === 'repeat'}
        onClose={() => setOpenModal(null)}
        initialRepeat={draft.repeat}
        onConfirm={(repeat) => setField('repeat', repeat)}
      />
    </>
  );
}

export default BottomSheet;
