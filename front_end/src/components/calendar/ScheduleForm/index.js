import React, { useState, useEffect } from 'react';
import { formatDateYYYYMMDD } from '../../../utils/dateUtils';
import { validateSchedule } from '../../../utils/validationUtils';
import './ScheduleForm.css';

/**
 * 일정 생성 및 수정 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.schedule - 수정할 일정 데이터 (생성 시 null)
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onSubmit - 폼 제출 핸들러
 * @param {Function} props.onCancel - 취소 버튼 핸들러
 * @returns {React.ReactElement}
 */
const ScheduleForm = ({ schedule, projects, onSubmit, onCancel }) => {
  // 기본 상태 초기화
  const [formData, setFormData] = useState({
    title: '',
    date: formatDateYYYYMMDD(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    type: 'PROJECT', // 'PROJECT' 또는 'INACTIVE'
    projectId: '',
    content: '',
    description: '' // INACTIVE 타입에서만 사용
  });
  
  const [errors, setErrors] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(false);
  
  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title || '',
        date: schedule.date || formatDateYYYYMMDD(new Date()),
        startTime: schedule.startTime || '09:00',
        endTime: schedule.endTime || '10:00',
        type: schedule.type || 'PROJECT',
        projectId: schedule.projectId || '',
        content: schedule.content || '',
        description: schedule.description || ''
      });
    }
  }, [schedule]);
  
  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 일정 타입이 변경되면 관련 필드 초기화
    if (name === 'type') {
      if (value === 'PROJECT') {
        setFormData(prev => ({
          ...prev,
          type: value,
          description: '',
        }));
      } else if (value === 'INACTIVE') {
        setFormData(prev => ({
          ...prev,
          type: value,
          projectId: '',
          content: '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // 필드 오류 상태 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitDisabled(true);
    
    // 유효성 검사
    const validation = validateSchedule(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmitDisabled(false);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">일정 제목 *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="일정 제목을 입력하세요"
          required
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="date">날짜 *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        {errors.date && <span className="error">{errors.date}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startTime">시작 시간 *</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          {errors.startTime && <span className="error">{errors.startTime}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">종료 시간 *</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
          {errors.endTime && <span className="error">{errors.endTime}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="type">일정 유형 *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="PROJECT">프로젝트 활동</option>
          <option value="INACTIVE">비활동 시간 (수업, 휴식 등)</option>
        </select>
      </div>
      
      {formData.type === 'PROJECT' && (
        <>
          <div className="form-group">
            <label htmlFor="projectId">프로젝트 *</label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required={formData.type === 'PROJECT'}
            >
              <option value="">프로젝트를 선택하세요</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <span className="error">{errors.projectId}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="content">활동 내용 *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="구체적인 활동 내용을 작성하세요"
              required={formData.type === 'PROJECT'}
            />
            {errors.content && <span className="error">{errors.content}</span>}
          </div>
        </>
      )}
      
      {formData.type === 'INACTIVE' && (
        <div className="form-group">
          <label htmlFor="description">설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="비활동 시간에 대한 설명을 작성하세요 (선택사항)"
          />
        </div>
      )}
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn-primary" disabled={submitDisabled}>
          {schedule ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;
