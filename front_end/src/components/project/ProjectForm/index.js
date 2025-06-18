import React, { useState, useEffect } from 'react';
import { validateProject } from '../../../utils/validationUtils';
import './ProjectForm.css';

/**
 * 프로젝트 생성 및 수정 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.project - 수정할 프로젝트 데이터 (생성 시 null)
 * @param {Function} props.onSubmit - 폼 제출 핸들러
 * @param {Function} props.onCancel - 취소 버튼 핸들러
 * @returns {React.ReactElement}
 */
const ProjectForm = ({ project, onSubmit, onCancel }) => {
  // 기본 상태 초기화
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    monthlyRequiredHours: 0
  });
  
  const [errors, setErrors] = useState({});
  const [submitDisabled, setSubmitDisabled] = useState(false);
  
  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        monthlyRequiredHours: project.monthlyRequiredHours || 0
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
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitDisabled(true);
    
    // 유효성 검사
    const validation = validateProject(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setSubmitDisabled(false);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <form className="project-form" onSubmit={handleSubmit}>
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
        <label htmlFor="description">설명</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="프로젝트 설명을 입력하세요"
        />
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
