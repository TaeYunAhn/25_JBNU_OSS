import React from 'react';
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
        {/* 백엔드 개발 완료 후 다시 인증 요구로 변경 예정 */}
        <Route 
          path="/calendar/:year/:month" 
          element={<Calendar />}
        />
        {/* 인증 적용 시 아래 코드 사용
        <Route 
          path="/calendar/:year/:month" 
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          } 
        />
        */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
