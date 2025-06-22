import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import ScheduleForm from '../ScheduleForm';
import ScheduleDetail from '../ScheduleDetail';
import ProjectActivityModal from '../../project/ProjectActivityModal';
import useSchedule from '../../../hooks/useSchedule';
import { useToast } from '../../../contexts/ToastContext';
import './ScheduleModal.css';

/**
 * 일정 모달 컴포넌트 (생성, 수정, 상세보기 통합)
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {string} props.mode - 모달 모드 ('create', 'edit', 'view')
 * @param {Object} props.schedule - 일정 데이터 (수정/조회 시)
 * @param {Date} props.initialDate - 선택된 날짜 (생성 시)
 * @param {Array} props.projects - 프로젝트 목록
 * @param {Function} props.onSubmit - 제출 핸들러 (생성/수정)
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {Function} props.onClose - 닫기 핸들러
 * @returns {React.ReactElement}
 */
const ScheduleModal = ({
  isOpen,
  mode = 'view',
  schedule,
  initialDate,
  projects,
  onSubmit,
  onDelete,
  onClose
}) => {
  const { showToast } = useToast(); // 토스트 알림 사용
  const [currentMode, setCurrentMode] = useState(mode);
  const [formError, setFormError] = useState(null); // 오류 상태 추가
  
  // 프로젝트 활동 모달 관련 상태
  const [selectedProject, setSelectedProject] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  
  // 스케줄 훅에서 프로젝트 활동 조회 함수 가져오기
  const { getProjectRecentActivities } = useSchedule();
  
  // 모달 모드 상태 업데이트
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode, isOpen]);
  
  // 모달 제목 결정
  const getModalTitle = () => {
    switch (currentMode) {
      case 'create':
        return '새 일정 추가';
      case 'edit':
        return '일정 수정';
      case 'view':
      default:
        return '일정 상세';
    }
  };
  
  // 편집 모드로 전환
  const handleEdit = () => {
    setCurrentMode('edit');
  };
  
  // 폼 제출 처리
  const handleSubmit = async (formData) => {
    console.log('폼 제출 시작', formData);
    // 오류 상태 초기화
    setFormError(null);
    
    try {
      console.log('부모 onSubmit 호출 시작');
      await onSubmit(formData, schedule?.id);
      console.log('부모 onSubmit 호출 성공');
      onClose(); // 성공 시에만 모달 닫기
    } catch (error) {
      console.error('일정 제출 실패:', error);
      console.log('오류 내용:', error.message);
      
      // 오류 메시지 추출
      let errorMessage = error.message || '일정 저장중 알 수 없는 오류가 발생했습니다.';
      console.log('추출된 오류 메시지:', errorMessage);
      
      // 충돌 일정 확인
      if (errorMessage.includes('일정 중복') || errorMessage.includes('이미 일정이 존재합니다') || errorMessage.includes('중복')) {
        console.log('충돌 일정 감지됨');
        // 상세한 오류 메시지 한글화
        if (errorMessage.includes('\n\n충돌 일정:')) {
          const mainError = errorMessage.split('\n\n')[0].replace('일정 중복: ', '');
          const conflictDetails = errorMessage.split('\n\n')[1];
          console.log('충돌 상세 정보:', conflictDetails);
          errorMessage = `해당 시간에 이미 일정이 존재합니다. (${conflictDetails})`;
        } else {
          errorMessage = '해당 시간에 이미 일정이 존재합니다. 다른 시간을 선택해주세요.';
        }
      }
      
      // 토스트 알림 표시 - 모달에서 바로 표시 (크고 딩기게)
      showToast(errorMessage, 'error');
      
      // 펼 오류 상태 업데이트
      setFormError(errorMessage);
      console.log('최종 오류 메시지 설정:', errorMessage);
    }
  };
  
  // 폼 취소 처리
  const handleCancel = () => {
    if (currentMode === 'edit' && schedule) {
      // 편집 모드에서 취소하면 상세보기로 돌아감
      setCurrentMode('view');
    } else {
      // 생성 모드에서는 모달 닫기
      onClose();
    }
  };
  
  // 삭제 처리
  const handleDelete = async () => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await onDelete(schedule.id);
        onClose(); // 성공 시에만 모달 닫기
      } catch (error) {
        console.error('일정 삭제 오류:', error);
        const errorMsg = error.message || '일정 삭제 중 오류가 발생했습니다.';
        showToast(errorMsg, 'error');
      }
    }
  };
  
  // 프로젝트 활동 모달 열기
  const handleOpenActivityModal = (projectId) => {
    if (!projectId) return;
    
    const numericProjectId = Number(projectId);
    let selectedProjectObj = projects.find(p => p.id === numericProjectId);
    if (!selectedProjectObj) {
      selectedProjectObj = projects.find(p => p.id === projectId);
    }
    if (!selectedProjectObj) {
      selectedProjectObj = projects.find(p => String(p.id) === String(projectId));
    }
    
    if (!selectedProjectObj && projectId) {
      selectedProjectObj = {
        id: projectId,
        name: '선택한 프로젝트',
      };
    }
    
    setSelectedProject(selectedProjectObj);
    loadRecentActivities(projectId);
    setShowActivityModal(true);
  };
  
  // 프로젝트 활동 모달 닫기 - 강화
  const handleCloseActivityModal = () => {
    console.log('프로젝트 활동 모달 닫기');
    setShowActivityModal(false);
    // 로그 추가
    setTimeout(() => {
      console.log('모달 상태:', showActivityModal);
    }, 10);
  };
  
  // 최근 활동 데이터 로드
  const loadRecentActivities = async (projectId) => {
    if (!projectId) {
      setRecentActivities([]);
      return;
    }
    
    setLoadingActivities(true);
    try {
      const activities = await getProjectRecentActivities(Number(projectId));
      setRecentActivities(activities);
    } catch (error) {
      console.error('최근 활동 내역 로드 중 오류:', error);
    } finally {
      setLoadingActivities(false);
    }
  };
  
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={getModalTitle()}
        size="medium"
      >
        {(currentMode === 'create' || currentMode === 'edit') ? (
          <ScheduleForm
            schedule={currentMode === 'edit' ? schedule : null} // 생성 모드에서는 항상 null 전달
            initialDate={initialDate}
            projects={projects}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onProjectSelect={handleOpenActivityModal}
            apiError={formError} // 오류 상태 전달
          />
        ) : (
          <ScheduleDetail
            schedule={schedule}
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={onClose}
          />
        )}
      </Modal>
      
      {/* 프로젝트 활동 모달 - 별도의 모달로 표시 */}
      {selectedProject && (
        <ProjectActivityModal 
          isOpen={showActivityModal} 
          onClose={handleCloseActivityModal} 
          projectId={selectedProject.id} 
          projectName={selectedProject.name} 
        />
      )}
    </>
  );
};

export default ScheduleModal;
