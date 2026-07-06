// app/AppShell.jsx
// 뷰 라우팅: list / calendar / search / stats
// 알림 클릭 → 상세 뷰 이동 (openDetailById)

import React, { useState } from 'react';
import { useTheme } from '../shared/theme/ThemeContext';
import Header from '../shared/layout/Header';
import Navigation from '../shared/layout/Navigation';
import Sidebar from '../shared/layout/Sidebar';

import TodoListView from '../features/todo/components/TodoListView';
import BottomSheet from '../features/todo/components/BottomSheet';
import TodoDetailView from '../features/todo/components/TodoDetailView';
import SearchView from '../features/search/components/SearchView';
import CalendarView from '../features/calendar/components/CalendarView';
import StatsView from '../features/stats/components/StatsView';
import NotificationPanel from '../features/notification/components/NotificationPanel';
import { useTodos } from '../features/todo/store/TodoContext';

const VIEWS = {
  LIST: 'list',
  CALENDAR: 'calendar',
  SEARCH: 'search',
  STATS: 'stats',
};

function AppShell() {
  const { theme } = useTheme();
  const { addTodo, editTodo, allTodos } = useTodos();

  const [view, setView] = useState(VIEWS.LIST);
  const [detailTodoId, setDetailTodoId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [sheet, setSheet] = useState({ open: false, editingTodo: null });

  const detailTodo = detailTodoId ? allTodos.find((t) => t.id === detailTodoId) : null;

  const openDetail = (todo) => setDetailTodoId(todo.id);
  const openDetailById = (todoId) => {
    // 알림 클릭 시: id로 todo 존재 여부 확인 후 열기 (삭제된 todo 방어)
    if (allTodos.some((t) => t.id === todoId)) setDetailTodoId(todoId);
  };
  const closeDetail = () => setDetailTodoId(null);

  const openAddSheet = () => setSheet({ open: true, editingTodo: null });
  const openEditSheet = (todo) => setSheet({ open: true, editingTodo: todo });
  const closeSheet = () => setSheet((s) => ({ ...s, open: false }));

  const goHome = () => {
    closeDetail();
    setView(VIEWS.LIST);
  };

  const goToStats = () => {
    closeDetail();
    setView(VIEWS.STATS);
    setIsMenuOpen(false);
  };

  // 상세 뷰 전체 화면
  if (detailTodo) {
    return (
      <div className="phone-wrapper" data-theme={theme}>
        <TodoDetailView todo={detailTodo} onBack={closeDetail} />
      </div>
    );
  }

  return (
    <div className="phone-wrapper" data-theme={theme}>
      <Header title="Todo-List" onHome={goHome} />

      {view === VIEWS.LIST && (
        <TodoListView
          onOpenAddSheet={openAddSheet}
          onOpenEditSheet={openEditSheet}
          onOpenDetail={openDetail}
        />
      )}
      {view === VIEWS.CALENDAR && <CalendarView />}
      {view === VIEWS.SEARCH && <SearchView />}
      {view === VIEWS.STATS && <StatsView />}

      <Navigation
        activeView={view}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenCalendar={() => setView(VIEWS.CALENDAR)}
        onOpenSearch={() => setView(VIEWS.SEARCH)}
        onOpenNoti={() => setIsNotiOpen(true)}
      />

      <Sidebar
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectCategory={goHome}
        onOpenStats={goToStats}
      />
      <BottomSheet
        isOpen={sheet.open}
        mode={sheet.editingTodo ? 'edit' : 'add'}
        initialDraft={sheet.editingTodo}
        onClose={closeSheet}
        onAddTodo={addTodo}
        onEditTodo={editTodo}
      />
      <NotificationPanel
        isOpen={isNotiOpen}
        onClose={() => setIsNotiOpen(false)}
        onOpenTodo={openDetailById}
      />
    </div>
  );
}

export default AppShell;
