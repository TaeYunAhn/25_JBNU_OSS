import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import ProjectForm from '../ProjectForm';
import ProjectDetail from '../ProjectDetail';
import { useToast } from '../../../contexts/ToastContext';
import './ProjectModal.css';

/**
 * 프로젝트 생성, 수정 및 상세보기 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {string} props.mode - 모달 모드 ('create', 'edit', 'view')
 * @param {Object} props.project - 프로젝트 데이터 (수정/조회 시)
 * @param {Function} props.onSubmit - 제출 핸들러 (생성/수정)
 * @param {Function} props.onDelete - 삭제 핸들러
 * @param {Function} props.onClose - 닫기 핸들러
 * @param {number} props.selectedYear - 캘린더에서 선택한 연도
 * @param {number} props.selectedMonth - 캘린더에서 선택한 월
 * @returns {React.ReactElement}
 */
const ProjectModal = ({ 
  isOpen, 
  mode = 'view',
  project, 
  onSubmit,
  onDelete, 
  onClose,
  selectedYear,
  selectedMonth
}) => {
  const { showToast } = useToast();
  const [currentMode, setCurrentMode] = useState(mode);
  const [formError, setFormError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 모달 모드 상태 업데이트
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode, isOpen]);
  
  // 모달 제목 결정
  const getModalTitle = () => {
    switch (currentMode) {
      case 'create':
        return '프로젝트 추가';
      case 'edit':
        return '프로젝트 수정';
      case 'view':
      default:
        return '프로젝트 상세';
    }
  };
  
  // 편집 모드로 전환
  const handleEdit = () => {
    setCurrentMode('edit');
  };
  
  // 폼 제출 처리
  const handleSubmit = async (formData) => {
    setFormError(null);
    
    try {
      await onSubmit(formData, project?.id);
      const actionText = currentMode === 'create' ? '생성' : '수정';
      showToast(`'${formData.name}' 프로젝트가 ${actionText}되었습니다.`, 'success');
      // 폼 제출 후 새로고침 트리거 값 증가
      setRefreshTrigger(prev => prev + 1);
      onClose();
    } catch (error) {
      console.error('프로젝트 저장 중 오류 발생:', error);
      const errorMsg = error.message || `프로젝트 ${currentMode === 'create' ? '생성' : '수정'} 중 오류가 발생했습니다.`;
      setFormError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };
  
  // 폼 취소 처리
  const handleCancel = () => {
    if (currentMode === 'edit' && project) {
      // 편집 모드에서 취소하면 상세보기로 돌아감
      setCurrentMode('view');
    } else {
      // 생성 모드에서는 모달 닫기
      onClose();
    }
  };
  
  // 삭제 처리
  const handleDelete = async () => {
    if (window.confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      try {
        await onDelete(project.id);
        showToast(`'${project.name}' 프로젝트가 삭제되었습니다.`, 'success');
        onClose(); // 성공 시에만 모달 닫기
      } catch (error) {
        console.error('프로젝트 삭제 오류:', error);
        const errorMsg = error.message || '프로젝트 삭제 중 오류가 발생했습니다.';
        showToast(errorMsg, 'error');
      }
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="medium"
    >
      {(currentMode === 'create' || currentMode === 'edit') ? (
        <ProjectForm
          project={currentMode === 'edit' ? project : null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          apiError={formError}
        />
      ) : (
        currentMode === 'view' && project && (
          <ProjectDetail 
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={onClose}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            refreshTrigger={refreshTrigger}
          />
        )
      )}
    </Modal>
  );
};

export default ProjectModal;
