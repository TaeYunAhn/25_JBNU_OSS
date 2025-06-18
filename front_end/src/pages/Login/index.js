import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading, error: authError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 사용자가 이미 로그인 되어 있으면 메인 페이지로 리디렉션
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // 인증 오류 처리
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // useAuth 훅의 login 함수 호출
      await login(username, password);
      // 로그인 성공 시 useEffect에서 리디렉션 처리
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>소중대 활동일지 캘린더</h1>
        <h2>로그인</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>테스트 계정: test / password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
