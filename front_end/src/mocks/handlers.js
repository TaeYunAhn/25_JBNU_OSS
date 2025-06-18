import { rest } from 'msw';
import projects from './data/projects';
import generateMockSchedules from './data/schedules';

let mockProjects = [...projects];
let lastProjectId = Math.max(...mockProjects.map(p => p.id), 0);

// 목업 핸들러
export const handlers = [
  // 인증 API
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { username, password } = req.body;
    
    // 간단한 인증 확인
    if (username === 'test' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'test',
            name: '테스트 사용자',
            email: 'test@example.com'
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
    );
  }),
  
  rest.get('/api/auth/me', (req, res, ctx) => {
    // 인증 확인 (실제로는 Authorization 헤더 확인)
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        username: 'test',
        name: '테스트 사용자',
        email: 'test@example.com'
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
