import React from 'react';
import { formatDateKorean } from '../../../utils/dateUtils';
import './ProjectList.css';

/**
 * 프로젝트 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onProjectClick - 프로젝트 클릭 핸들러
 * @param {Function} props.onAddProject - 프로젝트 추가 버튼 핸들러
 * @param {Function} props.onEditProject - 프로젝트 편집 버튼 핸들러
 * @param {number} props.selectedProjectId - 선택된 프로젝트 ID
 * @returns {React.ReactElement}
 */
const ProjectList = ({ 
  projects, 
  onProjectClick, 
  onAddProject, 
  onEditProject, 
  selectedProjectId 
}) => {
  // 활성화된 프로젝트만 필터링
  const filterActiveProjects = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return projects.filter(project => {
      return project.endDate >= todayStr;
    });
  };
  
  const activeProjects = filterActiveProjects();
  
  // 프로젝트 진행률 계산 (목업 - 실제로는 API에서 제공될 수 있음)
  const calculateProgress = (project) => {
    const today = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const passedDuration = today - startDate;
    const progress = Math.floor((passedDuration / totalDuration) * 100);
    
    return Math.min(100, Math.max(0, progress));
  };
  
  return (
    <div className="project-list">
      <div className="project-list-header">
        <h3>프로젝트 목록</h3>
        <button className="add-project-btn" onClick={onAddProject}>
          + 신규 프로젝트
        </button>
      </div>
      
      {activeProjects.length === 0 ? (
        <div className="no-projects">
          <p>활성화된 프로젝트가 없습니다.</p>
          <p>신규 프로젝트를 추가해주세요.</p>
        </div>
      ) : (
        <ul className="project-items">
          {activeProjects.map(project => {
            const progress = calculateProgress(project);
            const isSelected = selectedProjectId === project.id;
            
            return (
              <li 
                key={project.id}
                className={`project-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onProjectClick && onProjectClick(project.id)}
              >
                <div className="project-info">
                  <div className="project-header">
                    <h4 className="project-name">{project.name}</h4>
                    <button 
                      className="edit-project-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditProject && onEditProject(project);
                      }}
                    >
                      수정
                    </button>
                  </div>
                  
                  <div className="project-dates">
                    <span>{formatDateKorean(project.startDate)}</span>
                    <span> ~ </span>
                    <span>{formatDateKorean(project.endDate)}</span>
                  </div>
                  
                  <div className="project-hours">
                    <span>월 필수 시간: </span>
                    <strong>{project.monthlyRequiredHours}시간</strong>
                  </div>
                  
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="progress-text">{progress}% 진행</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProjectList;
