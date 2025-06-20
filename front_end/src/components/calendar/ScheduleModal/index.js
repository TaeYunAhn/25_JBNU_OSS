import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import ScheduleForm from '../ScheduleForm';
import ScheduleDetail from '../ScheduleDetail';
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
  const [currentMode, setCurrentMode] = useState(mode);
  
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
  const handleSubmit = (formData) => {
    onSubmit(formData, schedule?.id);
    onClose();
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
  const handleDelete = () => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      onDelete(schedule.id);
      onClose();
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
        <ScheduleForm
          schedule={currentMode === 'edit' ? schedule : (currentMode === 'create' && schedule ? schedule : null)}
          initialDate={initialDate}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
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
  );
};

export default ScheduleModal;
