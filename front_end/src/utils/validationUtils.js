/**
 * 유효성 검사 관련 유틸리티 함수
 */
import { timeStringToMinutes } from './dateUtils';

/**
 * 일정 충돌 여부 확인
 * @param {Object} newSchedule - 새로운 일정 또는 수정할 일정 데이터
 * @param {Array} existingSchedules - 기존 일정 목록
 * @param {number} [excludeId] - 제외할 일정 ID (수정 시 자기 자신 제외)
 * @returns {Object} { hasConflict: boolean, conflictSchedules: Array }
 */
export const checkScheduleConflict = (newSchedule, existingSchedules, excludeId = null) => {
  const { date, startTime, endTime } = newSchedule;
  const newStart = timeStringToMinutes(startTime);
  const newEnd = timeStringToMinutes(endTime);
  
  // 종료 시간이 시작 시간보다 이전인 경우 유효하지 않음
  if (newEnd <= newStart) {
    return { 
      hasConflict: true, 
      conflictSchedules: [], 
      error: '종료 시간은 시작 시간보다 이후여야 합니다.' 
    };
  }
  
  // 충돌하는 일정 찾기
  const conflicts = existingSchedules.filter(schedule => {
    // 자기 자신이면 제외
    if (excludeId && schedule.id === excludeId) return false;
    
    // 날짜가 다르면 충돌 없음
    if (schedule.date !== date) return false;
    
    const scheduleStart = timeStringToMinutes(schedule.startTime);
    const scheduleEnd = timeStringToMinutes(schedule.endTime);
    
    // 시간이 겹치는지 확인
    // (새 일정의 시작이 기존 일정의 종료 이전 && 새 일정의 종료가 기존 일정의 시작 이후)
    return (newStart < scheduleEnd && newEnd > scheduleStart);
  });
  
  return {
    hasConflict: conflicts.length > 0,
    conflictSchedules: conflicts,
    error: conflicts.length > 0 ? '해당 시간에 이미 다른 일정이 있습니다.' : null
  };
};

/**
 * 프로젝트 데이터 유효성 검사
 * @param {Object} projectData - 프로젝트 데이터
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateProject = (projectData) => {
  const errors = {};
  
  if (!projectData.name || projectData.name.trim() === '') {
    errors.name = '프로젝트 이름을 입력해주세요.';
  }
  
  if (!projectData.startDate) {
    errors.startDate = '시작 날짜를 선택해주세요.';
  }
  
  if (!projectData.endDate) {
    errors.endDate = '종료 날짜를 선택해주세요.';
  }
  
  if (projectData.startDate && projectData.endDate && new Date(projectData.startDate) > new Date(projectData.endDate)) {
    errors.endDate = '종료 날짜는 시작 날짜보다 이후여야 합니다.';
  }
  
  if (!projectData.monthlyRequiredHours || projectData.monthlyRequiredHours <= 0) {
    errors.monthlyRequiredHours = '월 필수 시간을 입력해주세요.';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * 일정 데이터 유효성 검사
 * @param {Object} scheduleData - 일정 데이터
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateSchedule = (scheduleData) => {
  const errors = {};
  
  if (!scheduleData.title || scheduleData.title.trim() === '') {
    errors.title = '일정 제목을 입력해주세요.';
  }
  
  if (!scheduleData.date) {
    errors.date = '날짜를 선택해주세요.';
  }
  
  if (!scheduleData.startTime) {
    errors.startTime = '시작 시간을 입력해주세요.';
  }
  
  if (!scheduleData.endTime) {
    errors.endTime = '종료 시간을 입력해주세요.';
  }
  
  if (scheduleData.startTime && scheduleData.endTime) {
    const startMinutes = timeStringToMinutes(scheduleData.startTime);
    const endMinutes = timeStringToMinutes(scheduleData.endTime);
    
    if (endMinutes <= startMinutes) {
      errors.endTime = '종료 시간은 시작 시간보다 이후여야 합니다.';
    }
  }
  
  if (scheduleData.type === 'PROJECT') {
    if (!scheduleData.projectId) {
      errors.projectId = '프로젝트를 선택해주세요.';
    }
    
    if (!scheduleData.content || scheduleData.content.trim() === '') {
      errors.content = '활동 내용을 입력해주세요.';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
