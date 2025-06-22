import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/common/Toast';

// 토스트 컨텍스트 생성
const ToastContext = createContext({
  showToast: () => {},
});

// 토스트 제공자 컴포넌트
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // 새 토스트 추가 함수
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now(); // 고유 ID 생성
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // 자동으로 일정 시간 후 제거 (백업 처리)
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration + 500); // 약간의 버퍼 시간을 추가
  };

  // 토스트 닫기 함수
  const closeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrapper">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => closeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 토스트 훅 생성
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
