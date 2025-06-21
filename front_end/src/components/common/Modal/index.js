import React, { useEffect, useRef } from 'react';
import penIcon from '../../../assets/images/pen.png';
import './Modal.css';

/**
 * 재사용 가능한 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 표시 여부
 * @param {Function} props.onClose - 모달 닫기 핸들러
 * @param {string} props.title - 모달 제목
 * @param {React.ReactNode} props.children - 모달 내용
 * @param {string} props.size - 모달 크기 (small, medium, large)
 * @returns {React.ReactElement}
 */
const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  const modalRef = useRef(null);
  
  // ESC 키 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // 모달 외부 클릭 시 닫기
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className={`modal-container ${size}`} ref={modalRef}>
        <div className="modal-header">
          <h2><img src={penIcon} alt="펜 아이콘" />{title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
