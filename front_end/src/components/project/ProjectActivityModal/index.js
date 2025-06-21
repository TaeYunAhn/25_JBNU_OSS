import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import useSchedule from '../../../hooks/useSchedule';
import './ProjectActivityModal.css';

// 테스트용 더미 활동 데이터
const DUMMY_ACTIVITIES = [
  { id: 1, date: '2025-06-15', content: '프로젝트 계획 수립' },
  { id: 2, date: '2025-06-17', content: '기능 구현 - 로그인' },
  { id: 3, date: '2025-06-19', content: '기능 구현 - 캘린더' },
  { id: 4, date: '2025-06-21', content: '테스트 및 디버깅' },
  { id: 5, date: '2025-06-22', content: '최종 검토 및 발표 준비' },
];

/**
 * 프로젝트 최근 활동을 보여주는 모달 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {string} props.projectId - 프로젝트 ID
 * @param {string} props.projectName - 프로젝트 이름
 * @returns {React.ReactElement}
 */
const ProjectActivityModal = ({ isOpen, onClose, projectId, projectName }) => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getProjectRecentActivities } = useSchedule();

  useEffect(() => {
    // 프로젝트 ID가 있고 모달이 열려있을 때만 데이터 로드
    if (projectId && isOpen) {
      loadRecentActivities(projectId);
    }
  }, [projectId, isOpen]);

  // 최근 활동 내역 로드
  const loadRecentActivities = async (projectId) => {
    setLoading(true);
    try {
      // projectId가 문자열인 경우 숫자로 변환
      const numericProjectId = Number(projectId);
      const activities = await getProjectRecentActivities(numericProjectId);
      console.log('로드된 활동:', activities); // 디버깅용 로그
      setRecentActivities(activities || []);
    } catch (error) {
      console.error('프로젝트 최근 활동 로드 실패:', error);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // 닫기 버튼 핸들러 - 최상위로 가져오기
  const handleClose = () => {
    console.log('모달 닫기 시도');
    onClose && onClose();
  };
  
  // 오버레이 클릭 핸들러 - 일정 모달에 영향을 주지 않도록 수정
  const overlayClick = (e) => {
    // 오버레이 클릭 시에도 모달을 닫지 않도록 변경
    // 현재 프로젝트 활동 모달은 X 버튼으로만 닫을 수 있음
    e.preventDefault();
    e.stopPropagation();
  };
  
  // ESC 키 이벤트 비활성화 - 다른 모달과 충돌 막기
  // 사용자가 직접 X 버튼을 클릭하도록 유도
  
  // 항상 테스트 데이터로 채우기
  useEffect(() => {
    if (isOpen && (!recentActivities || recentActivities.length === 0)) {
      console.log('테스트 데이터 사용');
      setRecentActivities(DUMMY_ACTIVITIES);
      setLoading(false);
    }
  }, [isOpen, recentActivities]);
  
  // 디버깅 로그 추가
  console.log('프로젝트 활동 모달 상태:', { isOpen, projectId, projectName });
  console.log('활동 로딩 상태:', loading, '활동 개수:', recentActivities?.length || 0);
  
  // 모달이 명확하게 표시되도록 함
  // isOpen이 true일 때만 모달이 보이도록 설정
  const displayStyle = isOpen ? 'flex' : 'none';
  
  // 모달이 열리지 않았으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }
  
  return (
    <div 
      className="project-activity-modal-overlay" 
      style={{ display: displayStyle }} 
      onClick={overlayClick}
    >
      <div className="project-activity-modal-container">
        <div className="modal-header">
          <h2>{projectName || '선택한 프로젝트'} 최근 활동</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="project-activities-container">
          {loading ? (
            <div className="loading-activities">로딩 중...</div>
          ) : recentActivities.length > 0 ? (
            <ul className="activities-list">
              {recentActivities.map(activity => (
                <li key={activity.id} className="activity-item">
                  <div className="activity-date">
                    {activity.date ? (
                      // 유효한 날짜 값인지 확인하고 안전하게 포맷팅
                      (() => {
                        try {
                          return format(new Date(activity.date), 'yyyy-MM-dd', { locale: ko });
                        } catch (e) {
                          return activity.date;
                        }
                      })()
                    ) : '날짜 없음'}
                  </div>
                  <div className="activity-content">{activity.content}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-activities">최근 활동이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectActivityModal;
