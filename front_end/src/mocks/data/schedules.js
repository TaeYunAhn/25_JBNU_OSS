/**
 * 목업 일정 데이터
 * 현재 날짜 기준으로 일정을 생성합니다.
 */

// 현재 년도와 월 설정
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// 날짜 포맷팅 헬퍼 함수
const formatDate = (year, month, day) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// 목업 일정 생성
const generateMockSchedules = (year = currentYear, month = currentMonth) => {
  return [
    // 프로젝트 활동 일정 (PROJECT 타입)
    {
      id: 1,
      title: '졸업 프로젝트 미팅',
      start: `${formatDate(year, month, 5)}T10:00:00`,
      end: `${formatDate(year, month, 5)}T12:00:00`,
      type: 'PROJECT',
      projectId: 1,
      content: '팀원들과 주간 진행상황 공유 및 다음 단계 계획 수립'
    },
    {
      id: 2,
      title: '알고리즘 스터디',
      start: `${formatDate(year, month, 7)}T14:00:00`,
      end: `${formatDate(year, month, 7)}T16:00:00`,
      type: 'PROJECT',
      projectId: 2,
      content: '그래프 알고리즘 문제 풀이'
    },
    {
      id: 3,
      title: '웹 개발 인턴십',
      start: `${formatDate(year, month, 10)}T09:00:00`,
      end: `${formatDate(year, month, 10)}T18:00:00`,
      type: 'PROJECT',
      projectId: 3,
      content: '프론트엔드 리액트 컴포넌트 개발'
    },
    {
      id: 4,
      title: 'AI 연구실 프로젝트',
      start: `${formatDate(year, month, 12)}T13:00:00`,
      end: `${formatDate(year, month, 12)}T17:00:00`,
      type: 'PROJECT',
      projectId: 4,
      content: '데이터셋 전처리 및 모델 학습'
    },
    {
      id: 5,
      title: '졸업 프로젝트 코딩',
      start: `${formatDate(year, month, 15)}T15:00:00`,
      end: `${formatDate(year, month, 15)}T19:00:00`,
      type: 'PROJECT',
      projectId: 1,
      content: '백엔드 API 구현'
    },
    
    // 비활동 시간 일정 (INACTIVE 타입)
    {
      id: 6,
      title: '알고리즘 수업',
      start: `${formatDate(year, month, 6)}T09:00:00`,
      end: `${formatDate(year, month, 6)}T12:00:00`,
      type: 'INACTIVE',
      description: '정규 수업'
    },
    {
      id: 7,
      title: '데이터베이스 수업',
      start: `${formatDate(year, month, 8)}T13:00:00`,
      end: `${formatDate(year, month, 8)}T15:00:00`,
      type: 'INACTIVE',
      description: '정규 수업'
    },
    {
      id: 8,
      title: '대학원 설명회',
      start: `${formatDate(year, month, 14)}T10:00:00`,
      end: `${formatDate(year, month, 14)}T12:00:00`,
      type: 'INACTIVE',
      description: '학과 행사'
    }
  ];
};

export default generateMockSchedules;
