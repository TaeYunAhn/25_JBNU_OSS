import axios from 'axios';

// 기본 API 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',  // 백엔드 URL 설정, 기본값은 같은 도메인
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 설정 - JWT 토큰 포함
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 - 401 오류 처리 (인증 만료)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 401 오류이고, 이미 재시도하지 않은 경우에만 토큰 갱신 시도
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // 로그인 페이지로의 리다이렉트 방지
      if (originalRequest.url.includes('/auth/')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      try {
        console.log('토큰 만료로 인한 갱신 시도...');
        // 토큰 갱신 시도
        const authService = (await import('./authService')).default;
        await authService.refreshToken();
        
        // 새 토큰으로 원래 요청 재시도
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('토큰을 가져오지 못했습니다.');
        }
        
        // 헤더에 새 토큰 설정
        originalRequest.headers = {
          ...originalRequest.headers,
          'Authorization': `Bearer ${token}`
        };
        
        console.log('토큰 갱신 성공, 요청 재시도:', originalRequest.url);
        return api(originalRequest);
      } catch (refreshError) {
        console.error('토큰 갱신 실패:', refreshError);
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
