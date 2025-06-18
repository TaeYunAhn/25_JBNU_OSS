import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import './App.css';

// 임시 인증 확인 함수 (백엔드 연동 전까지 사용)
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
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
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/calendar/:year/:month" 
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
