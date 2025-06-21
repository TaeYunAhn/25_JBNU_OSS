import api from './api';

// 목업 데이터 제거 - 실제 백엔드 API만 사용
const USE_MOCK_DATA = false;

// 목업용 빈 데이터 - 참조 오류 방지
const projects = [];

const projectService = {
  /**
   * 내 프로젝트 목록 조회
   * @returns {Promise} 프로젝트 목록
   */
  getMyProjects: async () => {
    try {
      if (USE_MOCK_DATA) {
        console.log('모의 프로젝트 데이터 사용 (백엔드 연동 전)');
        // 모의 데이터 사용
        return projects;
      } else {
        const response = await api.get('/api/projects');
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 목록 조회 중 오류:', error);
      if (USE_MOCK_DATA) {
        // 오류 발생 시 기본 모의 데이터 반환
        return projects;
      }
      throw error;
    }
  },

  /**
   * 새 프로젝트 생성
   * @param {Object} projectData - 생성할 프로젝트 데이터
   * @returns {Promise} 생성된 프로젝트 정보
   */
  createProject: async (projectData) => {
    try {
      if (USE_MOCK_DATA) {
        // 목업 데이터 사용 시 프로젝트 생성 로직
        console.log('목업 프로젝트 생성 (백엔드 연동 전)');
        const newId = Math.max(...projects.map(p => p.id)) + 1;
        const newProject = {
          ...projectData,
          id: newId
        };
        
        // 목업 데이터에 추가 (실제로는 로컬에만 저장되며 새로고침 시 초기화됨)
        projects.push(newProject);
        return newProject;
      } else {
        const response = await api.post('/api/projects', projectData);
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 생성 중 오류:', error);
      throw error;
    }
  },

  /**
   * 프로젝트 정보 수정
   * @param {number} projectId - 수정할 프로젝트 ID
   * @param {Object} projectData - 수정할 프로젝트 데이터
   * @returns {Promise} 수정된 프로젝트 정보
   */
  updateProject: async (projectId, projectData) => {
    try {
      if (USE_MOCK_DATA) {
        // 목업 데이터 사용 시 프로젝트 수정 로직
        console.log('목업 프로젝트 수정 (백엔드 연동 전)');
        
        // 프로젝트 찾기
        const index = projects.findIndex(p => p.id === projectId);
        
        if (index !== -1) {
          // 기존 프로젝트 수정
          const updatedProject = {
            ...projects[index],
            ...projectData,
            id: projectId // ID 변경 방지
          };
          
          projects[index] = updatedProject;
          return updatedProject;
        } else {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }
      } else {
        const response = await api.put(`/api/projects/${projectId}`, projectData);
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 수정 중 오류:', error);
      throw error;
    }
  },

  /**
   * 프로젝트 삭제
   * @param {number} projectId - 삭제할 프로젝트 ID
   * @returns {Promise} 삭제 결과
   */
  deleteProject: async (projectId) => {
    try {
      if (USE_MOCK_DATA) {
        // 목업 데이터 사용 시 프로젝트 삭제 로직
        console.log('목업 프로젝트 삭제 (백엔드 연동 전)');
        
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
          projects.splice(index, 1);
          return { success: true };
        } else {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }
      } else {
        const response = await api.delete(`/api/projects/${projectId}`);
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error);
      throw error;
    }
  },
  
  /**
   * 특정 프로젝트의 월별 통계 조회
   * @param {number} projectId - 조회할 프로젝트 ID
   * @param {number} year - 조회할 연도 
   * @param {number} month - 조회할 월(1-12)
   * @returns {Promise} 프로젝트의 월별 통계 정보
   */
  getProjectMonthlyStats: async (projectId, year, month) => {
    try {
      if (USE_MOCK_DATA) {
        // 목업 데이터 사용 시 통계 정보 생성
        console.log('목업 프로젝트 월별 통계 (백엔드 연동 전)');
        
        // 프로젝트 찾기
        const project = projects.find(p => p.id === projectId);
        
        if (!project) {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        // 목업 통계 데이터 생성 (실제 데이터 아님)
        return {
          projectId: projectId,
          year: year,
          month: month,
          completedHours: Math.floor(Math.random() * project.monthlyRequiredHours),
          requiredHours: project.monthlyRequiredHours,
          progressPercentage: Math.floor(Math.random() * 100)
        };
      } else {
        const response = await api.get(`/api/projects/${projectId}/monthly-stats?year=${year}&month=${month}`);
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 월별 통계 조회 중 오류:', error);
      
      // 오류 발생 시 기본값 반환
      return {
        projectId: projectId,
        year: year,
        month: month,
        completedHours: 0,
        requiredHours: 0,
        progressPercentage: 0
      };
    }
  }
};

export default projectService;
