import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Register.css';
import logo from '../../assets/images/logo.png';

function Register() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 사용자가 이미 로그인 되어 있으면 메인 페이지로 리디렉션
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 입력 필드가 변경될 때마다 에러 메시지 초기화
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 클라이언트 측 필드 검증
    if (!formData.email.trim()) {
      setError('이메일을 입력하세요.');
      return;
    }
    

    
    if (!formData.password.trim()) {
      setError('비밀번호를 입력하세요.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('유효한 이메일 주소를 입력하세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 회원가입 API 호출 (Mock Service Worker에서 처리)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입 중 오류가 발생했습니다.');
      }
      
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/login');
      
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-logo-container">
        <div className="register-logo">
          <img src={logo} alt="Callog" />
        </div>
        <div className="register-title">
          <h1>검침 없이 쌓이는 기록의 시발점.</h1>
        </div>
      </div>
      <div className="register-card">  
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">아이디</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@callog.com"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${error ? 'input-error' : ''}`}
            />
          </div>
          

          
          <div className="form-group">
            <label htmlFor="password" className="form-label">패스워드</label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.password}
                onChange={handleChange}
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">패스워드 확인</label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="**********"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-control ${error ? 'input-error' : ''}`}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
              >
                {showConfirmPassword ? (
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
            className="register-btn" 
            disabled={isLoading}
          >
            {isLoading ? '회원가입 중...' : '회원가입'}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <div className="register-divider">
          <span>또는</span>
        </div>
        
        <div className="register-footer">
          <p>이미 Callog회원이신가요? <Link to="/login" className="login-link">로그인</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
