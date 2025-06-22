import React, { useState, useEffect, useRef } from 'react';
import { formatDateKorean } from '../../../utils/dateUtils';
import projectService from '../../../services/projectService';
import './ProjectDetail.css';

// 프로젝트 통계 캐시 객체 - 전역으로 사용하여 불필요한 API 호출 방지
const statsCache = {};

// 캐시 키 생성 함수
const createCacheKey = (projectId, year, month) => `${projectId}-${year}-${month}`;

/**
 * 프로젝트 상세 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.project - 프로젝트 데이터
 * @param {Function} props.onEdit - 수정 버튼 클릭 핸들러
 * @param {Function} props.onDelete - 삭제 버튼 클릭 핸들러
 * @param {Function} props.onClose - 닫기 버튼 클릭 핸들러
 * @param {number} props.selectedYear - 선택한 연도
 * @param {number} props.selectedMonth - 선택한 월
 * @param {number} props.refreshTrigger - 새로고침 트리거 값 (변경 시 데이터 재로드)
 * @returns {React.ReactElement}
 */
const ProjectDetail = ({ 
  project, 
  onEdit, 
  onDelete, 
  onClose,
  selectedYear,
  selectedMonth,
  refreshTrigger = 0
}) => {
  const [projectStats, setProjectStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // API 요청 상태를 추적하는 ref
  const fetchingRef = useRef(false);
  // 마지막 업데이트된 캐시 키를 저장하는 ref
  const lastCacheKeyRef = useRef(null);
  
  // 프로젝트 통계 정보 가져오기
  useEffect(() => {
    if (!project || !project.id) return;
    
    // 타이머 참조 변수 
    let timeoutId = null;
    
    const fetchProjectStats = async () => {
      // 이미 요청 진행 중이면 스킵
      if (fetchingRef.current || loading) return;
      
      // 선택한 연도와 월 사용, 부족할 경우 현재 날짜 사용
      const date = new Date();
      const year = selectedYear || date.getFullYear();
      const month = selectedMonth || date.getMonth() + 1;
      
      // 캐시 키 생성
      const cacheKey = createCacheKey(project.id, year, month);
      
      // 이미 동일한 데이터를 가져왔다면 중복 요청 방지
      if (lastCacheKeyRef.current === cacheKey && projectStats) {
        console.log(`캐시된 프로젝트 통계 정보 사용: ${cacheKey}`);
        return;
      }
      
      // 캐시에 데이터가 있으면 사용
      if (statsCache[cacheKey]) {
        console.log(`캐시에서 프로젝트 통계 정보 로드: ${cacheKey}`);
        setProjectStats(statsCache[cacheKey]);
        lastCacheKeyRef.current = cacheKey;
        return;
      }
      
      // 새 요청 시작 표시
      fetchingRef.current = true;
      setLoading(true);
      
      try {
        console.log(`프로젝트 통계 정보 요청: 프로젝트 ID ${project.id}, 연도: ${year}, 월: ${month}`);
        
        const stats = await projectService.getProjectMonthlyStats(project.id, year, month);
        
        // 데이터 캐싱 및 상태 업데이트
        statsCache[cacheKey] = stats;
        setProjectStats(stats);
        lastCacheKeyRef.current = cacheKey;
      } catch (error) {
        console.error('프로젝트 통계 정보 불러오기 오류:', error);
      } finally {
        setLoading(false);
        fetchingRef.current = false; // 요청 완료 표시
      }
    };
    
    // 디바운스 처리 (300ms)
    clearTimeout(timeoutId);
    timeoutId = setTimeout(fetchProjectStats, 300);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      clearTimeout(timeoutId);
    };
  }, [project, selectedYear, selectedMonth, refreshTrigger]);
  
  // refreshTrigger가 변경되면 캐시 무효화 (필요한 경우에만)
  useEffect(() => {
    if (refreshTrigger > 0 && project?.id) {
      // 현재 프로젝트의 캐시만 선택적으로 무효화
      const keysToInvalidate = Object.keys(statsCache).filter(key => 
        key.startsWith(`${project.id}-`)
      );
      
      if (keysToInvalidate.length > 0) {
        console.log('새로고침 트리거로 인해 통계 캐시 무효화:', keysToInvalidate);
        keysToInvalidate.forEach(key => delete statsCache[key]);
      }
    }
  }, [refreshTrigger, project?.id]);
  
  if (!project) {
    return <div className="project-detail-empty">프로젝트 정보를 불러올 수 없습니다.</div>;
  }

  // 남은 기간 계산
  const calculateRemainingDays = () => {
    if (!project.endDate) return '기한 없음';
    
    const today = new Date();
    const endDate = new Date(project.endDate);
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return '종료됨';
    } else if (diffDays === 0) {
      return '오늘 마감';
    } else {
      return `${diffDays}일 남음`;
    }
  };

  // 진행률 계산 (실제 완료 시간 기반)
  const calculateProgress = () => {
    // 통계 정보가 있으면 실제 완료 시간 기반 진행률 계산
    if (projectStats && projectStats.completedHours !== undefined && project.monthlyRequiredHours) {
      const progress = (projectStats.completedHours / project.monthlyRequiredHours) * 100;
      return Math.min(Math.max(Math.round(progress * 100) / 100, 0), 100); // 바그: 2자리까지 정확도를 보이계 처리
    }
    
    // 통계 정보가 없으면 날짜 기반 진행률 계산 (폴백)
    if (!project.startDate || !project.endDate) return 0;
    
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    
    if (today < startDate) return 0;
    if (today > endDate) return 100;
    
    const totalDuration = endDate - startDate;
    const passedDuration = today - startDate;
    return Math.round((passedDuration / totalDuration) * 100);
  };
  
  // 완료 시간 가져오기
  const getCompletedHours = () => {
    if (projectStats && projectStats.completedHours !== undefined) {
      return projectStats.completedHours;
    }
    return 0;
  };
  
  // 현재 월 한국어 이름 가져오기
  const getMonthName = () => {
    const koreanMonths = [
      '1월', '2월', '3월', '4월', '5월', '6월', 
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    if (selectedMonth && selectedMonth >= 1 && selectedMonth <= 12) {
      return koreanMonths[selectedMonth - 1];
    }
    
    // 기본값: 현재 월
    const currentDate = new Date();
    return koreanMonths[currentDate.getMonth()];
  };

  return (
    <div className="project-detail">
      <div className="project-detail-header">
        <h3 className="project-title" style={{ color: project.color || '#4a6cf7' }}>
          {project.name}
        </h3>
      </div>
      
      <div className="project-detail-content">
        <div className="project-detail-row">
          <div className="detail-label">기간</div>
          <div className="detail-value">
            {formatDateKorean(project.startDate)} ~ {formatDateKorean(project.endDate)}
          </div>
        </div>
        
        <div className="project-detail-row">
          <div className="detail-label">상태</div>
          <div className="detail-value">
            <span className="remaining-days">{calculateRemainingDays()}</span>
          </div>
        </div>
        
        <div className="project-detail-row">
          <div className="detail-label">필수 시간</div>
          <div className="detail-value">
            <span className="required-hours" style={{ color: project.color || '#4a6cf7' }}>{project.monthlyRequiredHours}시간</span>
          </div>
        </div>
        
        <div className="project-detail-row">
          <div className="detail-label">{getMonthName()} 진행률</div>
          <div className="detail-value">
            <div className="progress-stats">
              <span className="project-hours">
                <span className="completed-hours">{getCompletedHours()}</span> / <span className="required-hours" style={{ color: project.color || '#4a6cf7' }}>{project.monthlyRequiredHours}</span> 시간
              </span>
            </div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${calculateProgress()}%`,
                    backgroundColor: project.color || '#4a6cf7'
                  }}
                />
              </div>
              <span className="progress-text">{calculateProgress().toFixed(2)}%</span>
            </div>
          </div>
        </div>
        
        {project.description && (
          <div className="project-detail-row">
            <div className="detail-label">설명</div>
            <div className="detail-value description">{project.description}</div>
          </div>
        )}
      </div>
      
      <div className="project-detail-actions">
        <button 
          onClick={onEdit} 
          className="btn-edit"
        >
          수정
        </button>
        <button 
          onClick={onDelete} 
          className="btn-delete"
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;
