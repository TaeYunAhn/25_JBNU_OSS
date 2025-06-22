import React, { useEffect } from 'react';
import './style.css';

const Toast = ({ message, type, onClose, duration = 3000 }) => {
  // 지정된 시간 후 자동으로 닫기
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-content">
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
