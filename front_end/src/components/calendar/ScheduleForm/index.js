import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useProject from '../../../hooks/useProject';
import useSchedule from '../../../hooks/useSchedule';
import './ScheduleForm.css';

// 날짜를 YYYY-MM-DD 형식으로 포맷팅하는 함수
const formatDateYYYYMMDD = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// 일정 유효성 검사 함수
const validateSchedule = (scheduleData) => {
  const errors = {};
  
  if (!scheduleData.title?.trim()) {
    errors.title = '제목을 입력하세요';
  }
  
  if (!scheduleData.date) {
    errors.date = '날짜를 선택하세요';
  }
  
  if (!scheduleData.startTime) {
    errors.startTime = '시작 시간을 선택하세요';
  }
  
  if (!scheduleData.endTime) {
    errors.endTime = '종료 시간을 선택하세요';
  }
  
  if (scheduleData.type === 'PROJECT' && !scheduleData.projectId) {
    errors.projectId = '프로젝트를 선택하세요';
  }
  
  if (scheduleData.type === 'PROJECT' && !scheduleData.content?.trim()) {
    errors.content = '활동 내용을 입력하세요';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 반복 주기 옵션
const REPEAT_OPTIONS = [
  { value: '', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
];

// 요일 옵션
const DAY_OPTIONS = [
  { value: '0', label: '일' },
  { value: '1', label: '월' },
  { value: '2', label: '화' },
  { value: '3', label: '수' },
  { value: '4', label: '목' },
  { value: '5', label: '금' },
  { value: '6', label: '토' },
];

/**
 * 선택된 날짜에 포함되는 프로젝트만 필터링하는 함수
 * @param {Array} projects - 프로젝트 목록
 * @param {string} selectedDate - 선택된 날짜 (YYYY-MM-DD 형식)
 * @returns {Array} 필터링된 프로젝트 목록
 */
const filterProjectsByDate = (projects, selectedDate) => {
  if (!selectedDate || !projects || projects.length === 0) {
    return [];
  }
  
  const selectedDateObj = new Date(selectedDate);
  const today = new Date();
  
  return projects.filter(project => {
    // 프로젝트가 이미 종료되었는지 확인
    const isActive = project.endDate >= today.toISOString().split('T')[0];
    
    // 프로젝트의 시작일과 종료일
    const projectStart = new Date(project.startDate);
    const projectEnd = new Date(project.endDate);
    
    // 선택된 날짜가 프로젝트 기간에 포함되는지 확인
    const isInProjectPeriod = 
      (projectStart <= selectedDateObj) && (projectEnd >= selectedDateObj);
    
    return isActive && isInProjectPeriod;
  });
};

/**
 * 일정 생성 및 수정 폼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.schedule - 수정시 일정 데이터
 * @param {Date} props.initialDate - 일정 생성 시 초기 날짜
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onSubmit - 제출 핸들러
 * @param {Function} props.onCancel - 취소 핸들러
 * @param {Function} props.onProjectSelect - 프로젝트 선택 시 호출될 함수
 * @param {string} props.apiError - API 오류 메시지
 * @returns {React.ReactElement}
 */
const ScheduleForm = ({ schedule, initialDate, projects = [], onSubmit, onCancel, onProjectSelect, apiError: externalApiError }) => {
  // 기본 상태 초기화
  const [formData, setFormData] = useState({
    title: '',
    type: 'PROJECT',
    projectId: '',
    content: '',
    description: '',
    date: initialDate ? formatDateYYYYMMDD(initialDate) : formatDateYYYYMMDD(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    repeat: {
      enabled: false,
      frequency: '',
      interval: 1,
      days: [],
      endType: 'never',
      endDate: '',
      endCount: 10
    }
  });
  
  const [errors, setErrors] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [apiError, setApiError] = useState(null); // API 오류 처리를 위한 상태
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { getProjectRecentActivities } = useSchedule();
  
  // 외부에서 전달된 오류 상태 반영
  useEffect(() => {
    if (externalApiError) {
      setApiError(externalApiError);
      // 기존 오류 메시지 요소가 있다면 제거
      const existingError = document.getElementById('force-error-message');
      if (existingError) {
        existingError.remove();
      }
    }
  }, [externalApiError]);
  
  // 날짜가 변경되면 프로젝트 선택 검증
  useEffect(() => {
    // 프로젝트가 선택되어 있고 일정 유형이 프로젝트인 경우
    if (formData.projectId && formData.type === 'PROJECT') {
      // 해당 날짜에 유효한 프로젝트만 필터링
      const validProjects = filterProjectsByDate(projects, formData.date);
      
      // 현재 선택된 프로젝트가 필터링된 목록에 있는지 확인
      const projectStillValid = validProjects.some(p => p.id === Number(formData.projectId) || p.id === formData.projectId);
      
      // 프로젝트가 유효하지 않으면 초기화
      if (!projectStillValid) {
        console.log('현재 선택된 프로젝트가 선택된 날짜에 유효하지 않음, 초기화함');
        setFormData(prev => ({
          ...prev,
          projectId: ''
        }));
      }
    }
  }, [formData.date, projects, formData.projectId, formData.type]);

  // 수정 모드이거나 선택한 날짜가 있을 때 폼 데이터 초기화
  useEffect(() => {
    if (schedule) {
      // 스케줄 데이터가 있는 경우 (수정 모드 또는 드래그로 선택한 날짜/시간 정보)
      setFormData({
        title: schedule.title || '',
        date: schedule.date || formatDateYYYYMMDD(new Date()),
        startTime: schedule.startTime || '09:00',
        endTime: schedule.endTime || '10:00',
        type: schedule.type || 'PROJECT',
        projectId: schedule.projectId || '',
        content: schedule.content || '',
        description: schedule.description || '',
        // 반복 설정 초기화
        repeat: schedule.repeat || {
          enabled: false,
          frequency: '',
          interval: 1,
          days: [],
          endType: 'never',
          endDate: '',
          endCount: 10
        }
      });
    } else if (initialDate) {
      // 스케줄이 없고 초기 날짜만 있는 경우 (생성 모드)
      setFormData(prev => ({
        ...prev,
        date: formatDateYYYYMMDD(initialDate)
      }));
    }
  }, [schedule, initialDate]);
  
  // 필드 값 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 체크박스 필드 처리
    if (type === 'checkbox') {
      if (name === 'repeatEnabled') {
        setFormData(prev => ({
          ...prev,
          repeat: {
            ...prev.repeat,
            enabled: checked,
          }
        }));
        return;
      }
    }
    
    // 프로젝트 선택 시 활동 모달 열기
    if (name === 'projectId' && value) {
      setSelectedProjectId(value);
      if (onProjectSelect) {
        onProjectSelect(value);
      }
    }
    
    // 반복 설정 필드 처리
    if (name.startsWith('repeat.')) {
      const repeatField = name.split('.')[1];
      
      setFormData(prev => ({
        ...prev,
        repeat: {
          ...prev.repeat,
          [repeatField]: value
        }
      }));
      return;
    }
    
    // 반복 요일 선택 처리
    if (name === 'repeatDay') {
      const dayValue = value;
      const currentDays = [...formData.repeat.days];
      
      // 이미 선택된 요일이면 제거, 아니면 추가
      const dayIndex = currentDays.indexOf(dayValue);
      if (dayIndex > -1) {
        currentDays.splice(dayIndex, 1);
      } else {
        currentDays.push(dayValue);
      }
      
      setFormData(prev => ({
        ...prev,
        repeat: {
          ...prev.repeat,
          days: currentDays
        }
      }));
      return;
    }
    
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 오류 초기화
    setApiError(null);
    
    // 반복 설정 정리
    const submitData = {
      ...formData,
      repeat: formData.repeat.enabled 
        ? (() => {
            // 반복이 활성화된 경우
            const repeatData = { ...formData.repeat };
            
            // endType에 따라 불필요한 필드 제거
            if (repeatData.endType === 'date') {
              delete repeatData.endCount;
              if (!repeatData.endDate) {
                delete repeatData.endDate; // endDate가 없으면 필드 자체를 제거
              }
            } else if (repeatData.endType === 'count') {
              delete repeatData.endDate;
              if (!repeatData.endCount) {
                delete repeatData.endCount;
              }
            } else if (repeatData.endType === 'never') {
              delete repeatData.endDate;
              delete repeatData.endCount;
            }
            
            return repeatData;
          })()
        : undefined // 반복이 비활성화된 경우 repeat 객체 자체를 보내지 않음
    };
    
    // 유효성 검사
    const validation = validateSchedule(submitData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    try {
      // 일정 제출
      await onSubmit(submitData);
    } catch (error) {
      console.error('일정 생성/수정 중 오류:', error);
      
      // 오류 메시지 추출
      const errorMessage = error.message || '일정을 저장하는 중 오류가 발생했습니다.';
      
      // 오류 상태 설정 (토스트 알림은 상위 컴포넌트에서 처리)
      if (errorMessage.includes('일정 중복') || errorMessage.includes('중복')) {
        setApiError('해당 시간에 이미 일정이 존재합니다. 다른 시간을 선택해주세요.');
      } else {
        setApiError(errorMessage);
      }
      
      return; // 함수 종료
    }
  };
  
  return (
    <>
      <div className="schedule-form-container">
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
              {filterProjectsByDate(projects, formData.date).map(project => (
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
      
      {/* 반복 설정 섹션 */}
      <div className="form-group">
        <div className="repeat-toggle">
          <input
            type="checkbox"
            id="repeatEnabled"
            name="repeatEnabled"
            checked={formData.repeat.enabled}
            onChange={handleChange}
          />
          <label htmlFor="repeatEnabled">반복 설정</label>
        </div>
        
        {formData.repeat.enabled && (
          <div className="repeat-settings">
            <div className="repeat-section">
              <h4>반복 설정</h4>
              
              <div className="repeat-row">
                <label>반복 주기</label>
                <div className="repeat-option">
                  <select 
                    name="repeat.frequency" 
                    value={formData.repeat.frequency} 
                    onChange={handleChange}
                    className="full-width"
                  >
                    {REPEAT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {formData.repeat.frequency === 'weekly' && (
                <div className="repeat-row">
                  <label>반복 요일</label>
                  <div className="day-selector">
                    {DAY_OPTIONS.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        name="repeatDay"
                        value={day.value}
                        onClick={(e) => handleChange({
                          target: {
                            name: 'repeatDay',
                            value: day.value
                          }
                        })}
                        className={formData.repeat.days.includes(day.value) ? 'day-btn selected' : 'day-btn'}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="repeat-row">
                <label>종료</label>
                <div className="end-options">
                  <div className="end-option">
                    <input
                      type="radio"
                      id="endNever"
                      name="repeat.endType"
                      value="never"
                      checked={formData.repeat.endType === 'never'}
                      onChange={handleChange}
                    />
                    <label htmlFor="endNever">없음</label>
                  </div>
                  
                  <div className="end-option">
                    <input
                      type="radio"
                      id="endDate"
                      name="repeat.endType"
                      value="date"
                      checked={formData.repeat.endType === 'date'}
                      onChange={handleChange}
                    />
                    <label htmlFor="endDate" style={{ width: '60px' }}>날짜:</label>
                    <input
                      type="date"
                      name="repeat.endDate"
                      value={formData.repeat.endDate || formatDateYYYYMMDD(new Date())}
                      onChange={handleChange}
                      disabled={formData.repeat.endType !== 'date'}
                    />
                  </div>
                  
                  <div className="end-option">
                    <input
                      type="radio"
                      id="endCount"
                      name="repeat.endType"
                      value="count"
                      checked={formData.repeat.endType === 'count'}
                      onChange={handleChange}
                    />
                    <label htmlFor="endCount" style={{ width: '80px' }}>다음</label>
                    <input
                      type="number"
                      name="repeat.endCount"
                      value={formData.repeat.endCount}
                      onChange={handleChange}
                      min="1"
                      max="999"
                      disabled={formData.repeat.endType !== 'count'}
                    />
                    <label style={{ width: '110px' }}>회 반복</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn-primary">
          {schedule ? '수정' : '생성'}
        </button>
      </div>
        </form>
      </div>
      

    </>
  );
};

export default ScheduleForm;
