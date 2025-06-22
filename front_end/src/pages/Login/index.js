import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Login.css';
import logo from '../../assets/images/logo.png';

function Login() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading, error: authError } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 사용자가 이미 로그인 되어 있으면 메인 페이지로 리디렉션
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // 인증 오류 처리 - authError가 변경될 때마다 로컬 에러 상태 업데이트
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = (e) => {
    // 페이지 새로고침 방지
    e.preventDefault();
    
    // 클라이언트 측 필드 검증
    if (!username.trim()) {
      setError('아이디를 입력하세요.');
      return;
    }
    
    if (!password.trim()) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    
    // 비동기 함수를 별도로 실행하여 폼 제출과 분리
    loginUser();
  };
  
  // 로그인 처리를 별도 함수로 분리
  const loginUser = async () => {
    try {
      // useAuth 훅의 login 함수 호출
      const result = await login(username, password);
      
      console.log('로그인 결과:', result); // 디버깅용
      
      // 로그인 성공 시에만 리디렉션 처리
      if (result && result.success) {
        navigate('/');
      } else {
        // 실패한 경우 에러 메시지 설정
        const errorMessage = result?.error || '아이디 또는 비밀번호가 올바르지 않습니다.';
        setError(errorMessage);
        // 폼 리셋하지 않고 비밀번호만 지우기
        setPassword('');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo-container">
        <div className="login-logo">
          <img src={logo} alt="Callog" />
        </div>
        <div className="login-title">
          <h1>기록이 쉬워지는 곳 ,</h1>
        </div>
      </div>
      <div className="login-card">  
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">아이디</label>
            <input
              id="username"
              type="text"
              placeholder="example@callog.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`form-control ${error ? 'input-error' : ''}`}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">패스워드</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-control ${error ? 'input-error' : ''}`}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path fill="#8b8b8b" d="M9.342 18.782l-1.931-.518.787-2.939a10.988 10.988 0 0 1-3.237-1.872l-2.153 2.154-1.415-1.415 2.154-2.153a10.957 10.957 0 0 1-2.371-5.07l1.968-.359C3.903 10.812 7.579 14 12 14c4.42 0 8.097-3.188 8.856-7.39l1.968.358a10.957 10.957 0 0 1-2.37 5.071l2.153 2.153-1.415 1.415-2.153-2.154a10.988 10.988 0 0 1-3.237 1.872l.787 2.94-1.931.517-.788-2.94a11.072 11.072 0 0 1-3.74 0l-.788 2.94z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path fill="#8b8b8b" d="M12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9C2.121 6.88 6.608 3 12 3zm0 16c4.411 0 8.044-3.067 8.834-7C20.044 8.067 16.411 5 12 5c-4.411 0-8.044 3.067-8.834 7 .79 3.933 4.423 7 8.834 7zm0-10c1.657 0 3 1.343 3 3s-1.343 3-3 3-3-1.343-3-3 1.343-3 3-3z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn" 
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <div className="login-divider">
          <span>또는</span>
        </div>
        
        <div className="login-footer">
          <p>아직 Callog회원이 아니신가요? <Link to="/register" className="register-link">회원가입</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
