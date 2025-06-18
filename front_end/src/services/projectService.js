import api from './api';

const projectService = {
  /**
   * 내 프로젝트 목록 조회
   * @returns {Promise} 프로젝트 목록
   */
  getMyProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('프로젝트 목록 조회 중 오류:', error);
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
      const response = await api.post('/projects', projectData);
      return response.data;
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
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
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
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('프로젝트 삭제 중 오류:', error);
      throw error;
    }
  }
};

export default projectService;
