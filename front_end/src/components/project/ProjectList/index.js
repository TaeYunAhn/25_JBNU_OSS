import React, { useState, useEffect } from 'react';
import { formatDateKorean } from '../../../utils/dateUtils';
// import projectService from '../../../services/projectService'; // 더 이상 필요 없음
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
 * @param {Object} props.projectStats - 부모로부터 전달받는 통계 데이터
 * @param {boolean} props.loading - 부모로부터 전달받는 로딩 상태
 * @returns {React.ReactElement}
 */
const ProjectList = ({ 
  projects, 
  onProjectClick, 
  onAddProject, 
  onEditProject, 
  selectedProjectId,
  year,
  month,
  projectStats,
  loading
}) => {
  // 프로젝트별 월별 통계 데이터 상태 관리 - 부모 컴포넌트로 이동
  // const [projectStats, setProjectStats] = useState({});
  // const [loading, setLoading] = useState(false);

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
  
  // 월별 프로젝트 통계 데이터 조회 - 부모 컴포넌트로 이동
  /*
  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!projects || projects.length === 0 || !year || !month) {
        return;
      }
      
      setLoading(true);
      
      try {
        // 언제나 새로운 통계 데이터 가져오기
        
        try {
          // 프로젝트 ID를 숫자로 변환하여 확실히 가져오기
          const statsPromises = projects.map(project => {
            const projectId = parseInt(project.id, 10) || project.id;
            return projectService.getProjectMonthlyStats(projectId, year, month);
          });
          
          const results = await Promise.all(statsPromises);
          
          // 결과를 프로젝트 ID를 키로 하는 객체로 변환
          const newStats = {};
          results.forEach(stat => {
            if (stat && stat.projectId) {
              newStats[stat.projectId] = {
                ...stat,
                year: parseInt(year),
                month: parseInt(month)
              };
            }
          });
          
          // 이전 통계 대체하지 않고 완전히 새로 설정
          setProjectStats(newStats);
        } catch (fetchError) {
          // console.error('프로젝트 통계 API 호출 오류:', fetchError);
          throw fetchError;
        }
      } catch (error) {
        // console.error('프로젝트 월별 통계 조회 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectStats();
  }, [projects, year, month, refreshTrigger]);
  */
  
  // 프로젝트 진행률 계산 (월별 통계 API 데이터 사용)
  const calculateProgress = (project) => {
    // API에서 가져온 데이터가 있는 경우에만 진행률 표시
    if (projectStats[project.id] && projectStats[project.id].progressPercentage !== undefined) {
      return projectStats[project.id].progressPercentage;
    }
    
    // API 데이터가 없는 경우 0% 반환
    // 날짜 기반 계산을 하지 않고 여기서 방식을 바꾸지 않음
    return 0;
  };
  
  // 프로젝트 완료 시간 조회 (월별 통계 API 데이터 사용)
  const getCompletedHours = (project) => {
    if (projectStats[project.id] && projectStats[project.id].completedHours !== undefined) {
      return projectStats[project.id].completedHours;
    }
    return '-'; // API 데이터가 없는 경우 '-'로 표시
  };
  
  return (
    <div className="project-list">
      <div className="project-list-header">
        <h3>프로젝트 목록 ({year}년 {month}월)</h3>
      </div>
      
      {loading ? ( // 로딩 상태 표시
        <div className="loading-spinner">
          <p>프로젝트 정보를 불러오는 중...</p>
        </div>
      ) : activeProjects.length === 0 ? (
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
