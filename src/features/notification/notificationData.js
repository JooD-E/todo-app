// features/notification/notificationData.js
// 하드코딩 JSX였던 알림을 데이터로 분리. 추후 서버 응답으로 교체 용이.

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    group: '오늘',
    icon: '⏰',
    desc: "10분 뒤 '아침 약 먹기' 시간입니다.",
    time: '방금 전',
    read: false,
  },
  {
    id: 'n2',
    group: '오늘',
    icon: '🏋️',
    desc: "오늘 예정된 '3분할 웨이트' 루틴을 시작할 시간입니다! 득근하십시오!",
    time: '1시간 전',
    read: false,
  },
  {
    id: 'n3',
    group: '이전 알림',
    icon: '🧗',
    desc: "'클라이밍' 완료! 이번 주 운동 목표 달성률 80%를 넘겼습니다!",
    time: '어제',
    read: true,
  },
  {
    id: 'n4',
    group: '이전 알림',
    icon: '⚠️',
    desc: "어제 완료하지 못한 '웹 퍼블리싱 포트폴리오 작업'이 오늘로 자동 연기되었습니다.",
    time: '어제',
    read: true,
  },
];
