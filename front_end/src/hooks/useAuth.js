import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

/**
 * 인증 관리를 위한 커스텀 훅
 * @returns {Object} 인증 관련 상태 및 메소드
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 로그인 상태 체크
  const checkAuthStatus = useCallback(async () => {
    setLoading(true);
    
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      console.error('인증 확인 중 오류:', err);
      setUser(null);
      setError('인증 상태를 확인할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  // 로그인
  const login = async (username, password) => {
    setLoading(true);
    
    // 로그인 시도 시 에러를 초기화하지 않고 계속 유지하도록 수정
    // setError(null); // 이 줄을 제거하여 이전 에러가 유지되어 사용자에게 계속 표시되도록 함
    
    try {
      const result = await authService.login(username, password);
      setUser(result.user);
      setError(null); // 성공시에만 에러 제거
      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  // 로그아웃
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAuth;
