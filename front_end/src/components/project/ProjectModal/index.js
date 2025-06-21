import React from 'react';
import Modal from '../../common/Modal';
import ProjectForm from '../ProjectForm';
import './ProjectModal.css';

/**
 * 프로젝트 생성 및 수정 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {string} props.mode - 모달 모드 ('create' 또는 'edit')
 * @param {Object} props.project - 수정할 프로젝트 데이터 (수정 시)
 * @param {Function} props.onSubmit - 제출 핸들러
 * @param {Function} props.onClose - 닫기 핸들러
 * @returns {React.ReactElement}
 */
const ProjectModal = ({ 
  isOpen, 
  mode = 'create', 
  project, 
  onSubmit, 
  onClose 
}) => {
  // 모달 제목 결정
  const getModalTitle = () => {
    return mode === 'create' ? '프로젝트 추가' : '프로젝트 수정';
  };
  
  // 폼 제출 처리
  const handleSubmit = (formData) => {
    onSubmit(formData, project?.id);
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="medium"
    >
      <ProjectForm
        project={mode === 'edit' ? project : null}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ProjectModal;
