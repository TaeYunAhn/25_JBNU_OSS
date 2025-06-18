import api from './api';

const authService = {
  /**
   * 로그인
   * @param {string} username - 사용자 아이디
   * @param {string} password - 비밀번호
   * @returns {Promise} 로그인 결과 및 토큰
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
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
    localStorage.removeItem('token');
    // 실제로는 서버에 로그아웃 요청을 보낼 수도 있음
    // api.post('/auth/logout');
  },

  /**
   * 현재 사용자 정보 조회
   * @returns {Promise} 현재 로그인한 사용자 정보
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('사용자 정보 조회 중 오류:', error);
      throw error;
    }
  },

  /**
   * 로그인 상태 확인
   * @returns {boolean} 로그인 상태 여부
   */
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  }
};

export default authService;
