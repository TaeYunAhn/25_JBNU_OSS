import api from './api';

const authService = {
  /**
   * 회원가입
   * @param {string} email - 이메일
   * @param {string} password - 비밀번호
   * @param {string} fullName - 이름
   * @returns {Promise} 회원가입 결과
   */
  signup: async (email, password, fullName) => {
    try {
      const response = await api.post('/api/auth/signup', { email, password, fullName });
      return response.data;
    } catch (error) {
      console.error('회원가입 중 오류:', error);
      throw error;
    }
  },
  
  /**
   * 로그인
   * @param {string} email - 사용자 이메일
   * @param {string} password - 비밀번호
   * @returns {Promise} 로그인 결과 및 토큰
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', { email: username, password });
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('로그인 중 오류:', error);
      throw error;
    }
  },

  /**
   * 로그아웃
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    // 백엔드에 로그아웃 통보 (토큰 무효화)
    api.post('/api/auth/logout').catch(error => {
      console.error('로그아웃 API 호출 중 오류:', error);
      // 로그아웃은 로컬 스토리지 클리어가 중요하며, 서버 요청은 실패해도 사용자는 로그아웃됨
    });
  },

  /**
   * 현재 사용자 정보 조회
   * @returns {Object} 현재 로그인한 사용자 정보
   */
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  /**
   * 토큰 재발급
   * @returns {Promise} 새로 발급된 액세스 토큰
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }
      
      const response = await api.post('/api/auth/refresh', { refreshToken });
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      return response.data;
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      authService.logout();
      throw error;
    }
  },

  /**
   * 로그인 상태 확인
   * @returns {boolean} 로그인 상태 여부
   */
  isAuthenticated: () => {
    return localStorage.getItem('accessToken') !== null;
  }
};

export default authService;
