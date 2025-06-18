import React from 'react';
import { formatDateKorean, formatDuration } from '../../../utils/dateUtils';
import './ScheduleDetail.css';

/**
 * 일정 상세 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.schedule - 일정 데이터
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onEdit - 편집 버튼 핸들러
 * @param {Function} props.onDelete - 삭제 버튼 핸들러
 * @param {Function} props.onClose - 닫기 버튼 핸들러
 * @returns {React.ReactElement}
 */
const ScheduleDetail = ({ schedule, projects, onEdit, onDelete, onClose }) => {
  if (!schedule) return null;
  
  // 일정에 해당하는 프로젝트 찾기
  const project = projects.find(p => p.id === schedule.projectId);
  
  // 시작 시간과 종료 시간에서 시간 차이 계산
  const startTime = schedule.startTime || schedule.start?.split('T')[1]?.substring(0, 5);
  const endTime = schedule.endTime || schedule.end?.split('T')[1]?.substring(0, 5);
  
  // 시간 포맷팅 (시작 시간 ~ 종료 시간)
  const timeRange = startTime && endTime ? `${startTime} ~ ${endTime}` : '';
  
  // 날짜 포맷팅
  const dateStr = schedule.date || 
                 (schedule.start ? schedule.start.split('T')[0] : '');
  const formattedDate = dateStr ? formatDateKorean(dateStr) : '';
  
  // 시간 차이 계산 (분 단위)
  let durationMinutes = 0;
  if (startTime && endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  }
  
  return (
    <div className="schedule-detail">
      <div className="schedule-header">
        <h3 className={`schedule-title ${schedule.type === 'INACTIVE' ? 'inactive' : ''}`}>
          {schedule.title}
        </h3>
        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
      
      <div className="schedule-info">
        <div className="info-item">
          <span className="info-label">날짜:</span>
          <span className="info-value">{formattedDate}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">시간:</span>
          <span className="info-value">{timeRange}</span>
        </div>
        
        {durationMinutes > 0 && (
          <div className="info-item">
            <span className="info-label">소요 시간:</span>
            <span className="info-value">{formatDuration(durationMinutes)}</span>
          </div>
        )}
        
        <div className="info-item">
          <span className="info-label">유형:</span>
          <span className="info-value">
            {schedule.type === 'PROJECT' ? '프로젝트 활동' : '비활동 시간'}
          </span>
        </div>
        
        {schedule.type === 'PROJECT' && project && (
          <div className="info-item">
            <span className="info-label">프로젝트:</span>
            <span className="info-value project-name">{project.name}</span>
          </div>
        )}
        
        {schedule.type === 'PROJECT' && schedule.content && (
          <div className="info-item content">
            <span className="info-label">활동 내용:</span>
            <p className="info-value content-text">{schedule.content}</p>
          </div>
        )}
        
        {schedule.type === 'INACTIVE' && schedule.description && (
          <div className="info-item content">
            <span className="info-label">설명:</span>
            <p className="info-value content-text">{schedule.description}</p>
          </div>
        )}
      </div>
      
      <div className="schedule-actions">
        <button className="btn-edit" onClick={() => onEdit(schedule)}>
          수정
        </button>
        <button className="btn-delete" onClick={() => onDelete(schedule)}>
          삭제
        </button>
      </div>
    </div>
  );
};

export default ScheduleDetail;
