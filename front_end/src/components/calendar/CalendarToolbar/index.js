import React from 'react';
import './CalendarToolbar.css';

/**
 * 캘린더 상단 툴바 컴포넌트
 * @param {Object} props
 * @param {Date} props.currentDate - 현재 보고 있는 날짜
 * @param {Function} props.onPrev - 이전 버튼 클릭 핸들러
 * @param {Function} props.onNext - 다음 버튼 클릭 핸들러
 * @param {Function} props.onToday - 오늘 버튼 클릭 핸들러
 * @param {string} props.view - 현재 뷰 (month, week, day)
 * @param {Function} props.onViewChange - 뷰 변경 핸들러
 * @param {Function} props.onAddSchedule - 일정 추가 버튼 핸들러
 * @param {Function} props.onExport - 내보내기 버튼 핸들러
 * @returns {React.ReactElement}
 */
const CalendarToolbar = ({ 
  currentDate, 
  onPrev, 
  onNext, 
  onToday, 
  view, 
  onViewChange,
  onAddSchedule,
  onExport
}) => {
  // 현재 년월 표시
  const formatTitle = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    if (view === 'month') {
      return `${year}년 ${month}월`;
    } else if (view === 'week') {
      // 주간 뷰의 시작일과 종료일 계산
      const firstDay = new Date(currentDate);
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // 주의 시작일 (월요일)
      firstDay.setDate(diff);
      
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 6);
      
      const firstMonth = firstDay.getMonth() + 1;
      const lastMonth = lastDay.getMonth() + 1;
      const firstDate = firstDay.getDate();
      const lastDate = lastDay.getDate();
      
      if (firstMonth === lastMonth) {
        return `${year}년 ${firstMonth}월 ${firstDate}일 - ${lastDate}일`;
      } else {
        return `${year}년 ${firstMonth}월 ${firstDate}일 - ${lastMonth}월 ${lastDate}일`;
      }
    } else if (view === 'day') {
      const date = currentDate.getDate();
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const weekday = weekdays[currentDate.getDay()];
      return `${year}년 ${month}월 ${date}일 (${weekday})`;
    }
    return '';
  };
  
  return (
    <div className="calendar-toolbar">
      <div className="toolbar-left">
        <button className="btn-today" onClick={onToday}>
          오늘
        </button>
        <div className="date-navigation">
          <button className="btn-nav" onClick={onPrev}>&lt;</button>
          <h2 className="current-date">{formatTitle()}</h2>
          <button className="btn-nav" onClick={onNext}>&gt;</button>
        </div>
      </div>
      
      <div className="toolbar-right">
        <div className="view-selector">
          <button 
            className={`view-btn ${view === 'month' ? 'active' : ''}`} 
            onClick={() => onViewChange('month')}
          >
            월
          </button>
          <button 
            className={`view-btn ${view === 'week' ? 'active' : ''}`} 
            onClick={() => onViewChange('week')}
          >
            주
          </button>
          <button 
            className={`view-btn ${view === 'day' ? 'active' : ''}`} 
            onClick={() => onViewChange('day')}
          >
            일
          </button>
        </div>
        
        <button className="btn-add" onClick={onAddSchedule}>
          + 일정추가
        </button>
        
        <button className="btn-export" onClick={onExport}>
          내보내기
        </button>
      </div>
    </div>
  );
};

export default CalendarToolbar;
