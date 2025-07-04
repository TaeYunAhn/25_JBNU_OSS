import React, { useState, useEffect } from 'react';
import { validateProject } from '../../../utils/validationUtils';
import './ProjectForm.css';

// 프로젝트 색상 옵션
const PROJECT_COLORS = [
  { id: 'red', label: '빨간색', value: '#E15B5B' },
  { id: 'blue', label: '파란색', value: '#5B8DEE' },
  { id: 'green', label: '초록색', value: '#4DA08C' },
  { id: 'orange', label: '주황색', value: '#F4A261' },
  { id: 'yellow', label: '노란색', value: '#F6D365' },
  { id: 'pink', label: '분홍색', value: '#EC9ABE' },
  { id: 'purple', label: '보라색', value: '#A29BFE' },
  { id: 'brown', label: '갈색', value: '#A9746E' },
  { id: 'gray', label: '회색', value: '#A8B0AD' },
  { id: 'black', label: '검정색', value: '#2F3A38' }
];

/**
 * 프로젝트 생성 및 수정 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.project - 수정할 프로젝트 데이터 (생성 시 null)
 * @param {Function} props.onSubmit - 폼 제출 핸들러
 * @param {Function} props.onCancel - 취소 버튼 핸들러
 * @param {string} props.apiError - API 오류 메시지 (백엔드 API 호출 실패시)
 * @returns {React.ReactElement}
 */
const ProjectForm = ({ project, onSubmit, onCancel, apiError }) => {
  // 기본 상태 초기화
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    monthlyRequiredHours: 0,
    color: PROJECT_COLORS[0].value
  });
  
  const [errors, setErrors] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [internalApiError, setInternalApiError] = useState(null);
  
  // 외부에서 전달된 API 오류 상태 반영
  useEffect(() => {
    if (apiError) {
      setInternalApiError(apiError);
    }
  }, [apiError]);
  
  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        monthlyRequiredHours: project.monthlyRequiredHours || 0,
        color: project.color || PROJECT_COLORS[0].value
      });
    }
  }, [project]);
  
  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 시간 입력의 경우 숫자로 변환
    if (name === 'monthlyRequiredHours') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
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
    setSubmitDisabled(true);
    setInternalApiError(null);
    
    // 유효성 검사
    const validation = validateProject(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmitDisabled(false);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('프로젝트 저장 중 오류:', error);
      setInternalApiError(error.message || '프로젝트를 저장하는 중 오류가 발생했습니다.');
      setSubmitDisabled(false);
    }
  };
  
  return (
    <form className="project-form" onSubmit={handleSubmit}>
      {internalApiError && (
        <div className="error-alert" style={{
          backgroundColor: '#f8d7da',
          color: '#721c24', 
          padding: '15px',
          marginBottom: '15px',
          borderRadius: '5px',
          border: '1px solid #f5c6cb',
          fontWeight: 'bold',
          fontSize: '16px',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="error-message">{internalApiError}</div>
          <button 
            type="button" 
            className="error-close-btn" 
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
            onClick={() => setInternalApiError(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="form-group">
        <label htmlFor="name">프로젝트 이름 *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="프로젝트 이름을 입력하세요"
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="color">프로젝트 색상 *</label>
        <div className="color-selector">
          {PROJECT_COLORS.map((colorOption) => (
            <div 
              key={colorOption.id} 
              className={`color-option ${formData.color === colorOption.value ? 'selected' : ''}`}
              style={{ backgroundColor: colorOption.value }}
              onClick={() => setFormData({...formData, color: colorOption.value})}
              title={colorOption.label}
            />
          ))}
        </div>
        {errors.color && <span className="error">{errors.color}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate">시작 날짜 *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          {errors.startDate && <span className="error">{errors.startDate}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="endDate">종료 날짜 *</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
          {errors.endDate && <span className="error">{errors.endDate}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="monthlyRequiredHours">월 필수 시간 (시간) *</label>
        <input
          type="number"
          id="monthlyRequiredHours"
          name="monthlyRequiredHours"
          value={formData.monthlyRequiredHours}
          onChange={handleChange}
          min="1"
          step="1"
          required
        />
        {errors.monthlyRequiredHours && <span className="error">{errors.monthlyRequiredHours}</span>}
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          취소
        </button>
        <button type="submit" className="btn-primary" disabled={submitDisabled}>
          {project ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
