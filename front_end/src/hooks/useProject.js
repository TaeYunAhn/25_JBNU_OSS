import { useState, useEffect, useCallback } from 'react';
import projectService from '../services/projectService';
import { validateProject } from '../utils/validationUtils';

/**
 * 프로젝트 관리를 위한 커스텀 훅
 * @returns {Object} 프로젝트 관련 상태 및 메소드
 */
const useProject = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // 모든 프로젝트 불러오기
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await projectService.getMyProjects();
      // 응답 데이터가 배열이 아닌 경우 빈 배열로 초기화
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        console.warn('프로젝트 데이터가 배열 형태가 아닙니다:', data);
        setProjects([]);
      }
    } catch (err) {
      console.error('프로젝트를 불러오는 중 오류가 발생했습니다:', err);
      // 오류 발생 시 빈 배열로 초기화하여 에러 방지
      setProjects([]);
      setError('프로젝트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 초기 데이터 로딩
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // 프로젝트 생성
  const createProject = async (projectData) => {
    setLoading(true);
    setError(null);
    
    // 유효성 검사
    const validation = validateProject(projectData);
    if (!validation.isValid) {
      setError('프로젝트 정보가 유효하지 않습니다.');
      setLoading(false);
      return { success: false, errors: validation.errors };
    }
    
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return { success: true, project: newProject };
    } catch (err) {
      setError('프로젝트를 생성하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 프로젝트 수정
  const updateProject = async (projectId, projectData) => {
    setLoading(true);
    setError(null);
    
    // 유효성 검사
    const validation = validateProject(projectData);
    if (!validation.isValid) {
      setError('프로젝트 정보가 유효하지 않습니다.');
      setLoading(false);
      return { success: false, errors: validation.errors };
    }
    
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData);
      setProjects(prev => prev.map(project => 
        project.id === projectId ? updatedProject : project
      ));
      
      // 선택된 프로젝트가 업데이트된 경우 업데이트
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      return { success: true, project: updatedProject };
    } catch (err) {
      setError('프로젝트를 수정하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 프로젝트 삭제
  const deleteProject = async (projectId) => {
    setLoading(true);
    setError(null);
    
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      
      // 선택된 프로젝트가 삭제된 경우 null로 설정
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }
      
      return { success: true };
    } catch (err) {
      setError('프로젝트를 삭제하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 진행 중인 프로젝트만 필터링 (현재 날짜가 시작일과 종료일 사이에 있는 프로젝트)
  const getActiveProjects = () => {
    // projects가 배열인지 확인하고 아닌 경우 빈 배열 반환
    if (!Array.isArray(projects)) {
      console.warn('projects가 배열이 아닙니다:', projects);
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 제거
    
    return projects.filter(project => {
      // project가 유효한 객체인지 확인
      if (!project || !project.startDate || !project.endDate) {
        return false;
      }
      
      try {
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        endDate.setHours(23, 59, 59, 999); // 종료일의 끝으로 설정
        
        return startDate <= today && today <= endDate;
      } catch (err) {
        console.error('날짜 비교 중 오류:', err);
        return false;
      }
    });
  };
  
  // 프로젝트 월별 진행률 계산 (실제 시간 / 월 필수 시간)
  const calculateProjectProgress = (projectId, totalHours) => {
    // projects가 배열인지 확인
    if (!Array.isArray(projects)) {
      console.warn('projects가 배열이 아닙니다:', projects);
      return 0;
    }
    
    const project = projects.find(p => p && p.id === projectId);
    if (!project || !project.monthlyRequiredHours) return 0;
    
    const progress = (totalHours / project.monthlyRequiredHours) * 100;
    return Math.min(Math.max(progress, 0), 100); // 0~100% 범위 내로 제한
  };
  
  return {
    projects,
    loading,
    error,
    selectedProject,
    setSelectedProject,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getActiveProjects,
    calculateProjectProgress
  };
};

export default useProject;
