import React, { useState } from 'react';
import './ProjectList.css';

function ProjectList({ projects = [] }) {
  const [showAddProject, setShowAddProject] = useState(false);

  return (
    <div className="project-list">
      {projects.map(project => (
        <div key={project.id} className="project-card">
          <div className="project-header">
            <h3>{project.name}</h3>
            <div className="project-actions">
              <button className="btn-icon">✏️</button>
              <button className="btn-icon">🗑️</button>
            </div>
          </div>
          
          <div className="project-period">
            {new Date(project.startDate).toLocaleDateString()} - 
            {new Date(project.endDate).toLocaleDateString()}
          </div>
          
          <div className="project-progress">
            <div className="progress-label">
              <span>월 필수 시간: {project.monthlyRequiredHours}시간</span>
              <span>현재 기록: 0시간</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      ))}
      
      <button 
        className="btn btn-secondary add-project-btn"
        onClick={() => setShowAddProject(true)}
      >
        + 프로젝트 추가
      </button>
      
      {/* 프로젝트 추가 모달은 별도 컴포넌트로 구현할 예정 */}
    </div>
  );
}

export default ProjectList;
