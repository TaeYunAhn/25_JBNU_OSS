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
  
  // 회원가입
  const signup = async (email, password, fullName) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.signup(email, password, fullName);
      return { success: true, user: result };
    } catch (err) {
      const errorMessage = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      throw err; 
    } finally {
      setLoading(false);
    }
  };
  
  // 초기 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  
  // 로그인
  const login = async (username, password) => {
    setLoading(true);
    
    try {
      const result = await authService.login(username, password);
      setUser(result.user);
      setError(null); 
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
    signup,
    checkAuthStatus
  };
};

export default useAuth;
