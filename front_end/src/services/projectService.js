import api from './api';
import projects from '../mocks/data/projects';

// 캘린더 디자인 및 테스트를 위한 모의 데이터 사용 여부
const USE_MOCK_DATA = true;

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
        const response = await api.get('/projects');
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
        const response = await api.post('/projects', projectData);
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
        const response = await api.put(`/projects/${projectId}`, projectData);
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
        const response = await api.delete(`/projects/${projectId}`);
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error);
      throw error;
    }
  }
};

export default projectService;
