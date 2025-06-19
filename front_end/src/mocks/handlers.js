import { rest } from 'msw';
import projects from './data/projects';
import generateMockSchedules from './data/schedules';

let mockProjects = [...projects];
let lastProjectId = Math.max(...mockProjects.map(p => p.id), 0);

// 목업 핸들러
export const handlers = [
  // 인증 API
  // 회원가입 API
  rest.post('/api/auth/signup', (req, res, ctx) => {
    const { email, password, fullName } = req.body;
    
    if (email && password && fullName) {
      return res(
        ctx.status(201),
        ctx.json({
          id: 1,
          email,
          fullName
        })
      );
    }
    
    return res(
      ctx.status(400),
      ctx.json({ 
        errorCode: "INVALID_INPUT", 
        message: '입력 데이터가 유효하지 않습니다.' 
      })
    );
  }),

  // 로그인 API
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    // 간단한 인증 확인 (테스트 계정 정보에 맞춰 수정)
    if (email === 'test@jbnu.ac.kr' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: 1,
            email: 'test@jbnu.ac.kr',
            fullName: '김테스트'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ 
        errorCode: "INVALID_CREDENTIALS", 
        message: '이메일 또는 비밀번호가 일치하지 않습니다.' 
      })
    );
  }),
  
  // 토큰 재발급 API
  rest.post('/api/auth/refresh', (req, res, ctx) => {
    const { refreshToken } = req.body;
    
    if (refreshToken === 'mock-refresh-token') {
      return res(
        ctx.status(200),
        ctx.json({
          accessToken: 'new-mock-access-token'
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ 
        errorCode: "INVALID_REFRESH_TOKEN", 
        message: '유효하지 않은 리프레시 토큰입니다.' 
      })
    );
  }),
  
  // 프로젝트 API
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(mockProjects)
    );
  }),
  
  rest.post('/api/projects', (req, res, ctx) => {
    const newProject = {
      id: ++lastProjectId,
      ...req.body
    };
    
    mockProjects.push(newProject);
    
    return res(
      ctx.status(201),
      ctx.json(newProject)
    );
  }),
  
  rest.put('/api/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    const projectIndex = mockProjects.findIndex(p => p.id === Number(id));
    
    if (projectIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: '프로젝트를 찾을 수 없습니다.' })
      );
    }
    
    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...req.body,
      id: Number(id)
    };
    
    return res(
      ctx.status(200),
      ctx.json(mockProjects[projectIndex])
    );
  }),
  
  rest.delete('/api/projects/:id', (req, res, ctx) => {
    const { id } = req.params;
    const projectIndex = mockProjects.findIndex(p => p.id === Number(id));
    
    if (projectIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: '프로젝트를 찾을 수 없습니다.' })
      );
    }
    
    mockProjects.splice(projectIndex, 1);
    
    return res(
      ctx.status(204)
    );
  }),
  
  // 일정 API
  rest.get('/api/schedules', (req, res, ctx) => {
    const year = Number(req.url.searchParams.get('year'));
    const month = Number(req.url.searchParams.get('month'));
    
    // 유효한 년월 확인
    if (!year || !month || month < 1 || month > 12) {
      return res(
        ctx.status(400),
        ctx.json({ message: '유효하지 않은 년도 또는 월입니다.' })
      );
    }
    
    const schedules = generateMockSchedules(year, month);
    
    return res(
      ctx.status(200),
      ctx.json(schedules)
    );
  }),
  
  // 활동일지 내보내기 API (실제로는 파일 다운로드이지만, 목업에서는 성공 응답만)
  rest.get('/api/export', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: '내보내기 성공' })
    );
  })
];
