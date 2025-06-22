import React, { useState, useEffect } from 'react';
import { formatDateKorean } from '../../../utils/dateUtils';
import projectService from '../../../services/projectService';
import './ProjectList.css';

// YY.MM.DD 형식으로 날짜 포맷팅하는 함수
const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  const yy = date.getFullYear().toString().slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};

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
  selectedProjectId,
  year,
  month
}) => {
  // 프로젝트별 월별 통계 데이터 상태 관리
  const [projectStats, setProjectStats] = useState({});
  const [loading, setLoading] = useState(false);
  // 활성화된 프로젝트와 선택된 년-월에 포함된 프로젝트만 필터링
  const filterActiveProjects = () => {
    if (!year || !month) {
      return []; // 년-월 정보가 없으면 빈 배열 반환
    }
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 선택된 년-월의 첫날과 마지막 날
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    return projects.filter(project => {
      // 프로젝트가 이미 종료되었는지 확인
      const isActive = project.endDate >= todayStr;
      
      // 프로젝트의 시작일과 종료일
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      // 프로젝트 기간과 선택된 월이 겹치는지 확인
      const isInMonth = 
        (projectStart <= endOfMonth) && (projectEnd >= startOfMonth);
      
      // 활성화 상태이면서 해당 월에 포함된 프로젝트만 반환
      return isActive && isInMonth;
    });
  };
  
  const activeProjects = filterActiveProjects();
  
  // 월별 프로젝트 통계 데이터 조회
  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!projects || projects.length === 0 || !year || !month) {
        console.log('통계 API 호출 건너뛼: 데이터 부족', { projects: projects?.length || 0, year, month });
        return;
      }
      
      console.log(`프로젝트 통계 조회 시작: ${year}년 ${month}월, 프로젝트 ${projects.length}개`);
      setLoading(true);
      
      try {
        // 이미 해당 월의 통계가 있는지 확인
        const existingStats = {};
        let needsFetch = false;
        
        projects.forEach(project => {
          const stat = projectStats[project.id];
          if (!stat || stat.year !== year || stat.month !== month) {
            needsFetch = true;
          } else {
            existingStats[project.id] = stat;
          }
        });
        
        // 이미 모든 프로젝트의 통계가 있다면 API 호출 필요 없음
        if (!needsFetch && Object.keys(existingStats).length === projects.length) {
          console.log('프로젝트 통계: 이미 캡시된 데이터 사용');
          setLoading(false);
          return;
        }
        
        const statsPromises = projects.map(project => 
          projectService.getProjectMonthlyStats(project.id, year, month)
        );
        
        const results = await Promise.all(statsPromises);
        
        // 결과를 프로젝트 ID를 키로 하는 객체로 변환
        const newStats = {};
        results.forEach(stat => {
          if (stat && stat.projectId) {
            console.log(`프로젝트 ${stat.projectId} 통계: 완료 ${stat.completedHours} / 요구 ${stat.requiredHours} 시간, 진도 ${stat.progressPercentage}%`);
            newStats[stat.projectId] = stat;
          }
        });
        
        setProjectStats(prev => ({ ...prev, ...newStats }));
      } catch (error) {
        console.error('프로젝트 월별 통계 조회 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectStats();
  }, [projects, year, month]);
  
  // 프로젝트 진행률 계산 (월별 통계 API 데이터 사용)
  const calculateProgress = (project) => {
    if (projectStats[project.id]) {
      return projectStats[project.id].progressPercentage;
    }
    
    // API 데이터가 없는 경우 기본 계산 방식 사용
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
  
  // 프로젝트 완료 시간 조회 (월별 통계 API 데이터 사용)
  const getCompletedHours = (project) => {
    if (projectStats[project.id]) {
      return projectStats[project.id].completedHours;
    }
    return 0; // API 데이터가 없는 경우 기본값
  };
  
  return (
    <div className="project-list">
      <div className="project-list-header">
        <h3>프로젝트 목록 ({year}년 {month}월)</h3>
      </div>
      
      {activeProjects.length === 0 ? (
        <div className="no-projects">
          <p>생성된 프로젝트가 없습니다.</p>
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
                    <span>{formatShortDate(project.startDate)}</span>
                    <span>~</span>
                    <span>{formatShortDate(project.endDate)}</span>
                  </div>
                  
                  <div className="project-hours">
                    <span>총 </span>
                    <span style={{ fontWeight: 'bold', color: '#343a40', marginRight: '4px' }}>
                      {getCompletedHours(project)} /
                    </span>
                    <span style={{ fontWeight: 'bold', color: project.color || '#0d6efd' }}>
                      {project.monthlyRequiredHours}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#343a40' }}> 시간</span>
                  </div>
                  
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: project.color || '#4a6cf7' // 지정된 프로젝트 색상 사용, 없으면 기본색
                        }}
                      />
                    </div>
                    <span className="progress-text">{progress}%</span>
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
