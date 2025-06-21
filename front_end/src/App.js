import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Register from './pages/Register';
import authService from './services/authService';
import './App.css';

// 백엔드 연동 인증 확인 함수
const isAuthenticated = () => {
  return authService.isAuthenticated();
};

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    // 토큰의 유효성 검증 로직을 추가할 수 있습니다.
    if (localStorage.getItem('accessToken')) {
      console.log('토큰이 존재합니다. 인증 상태:', authService.isAuthenticated());
      
      // 필요한 경우 백엔드에 토큰 유효성 검증 요청을 보낼 수 있습니다.
      // 백엔드에 토큰 검증 API가 있다면 여기서 호출하여 유효하지 않은 토큰을 정리합니다.
    } else {
      console.log('저장된 토큰이 없습니다.');
    }
  }, []);
  
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        {/* 백엔드 연동 완료로 인증 요구 적용 */}
        <Route 
          path="/calendar/:year/:month" 
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          } 
        />
        {/* 백엔드 개발 중 테스트용 코드
        <Route 
          path="/calendar/:year/:month" 
          element={<Calendar />}
        />
        */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
