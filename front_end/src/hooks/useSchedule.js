import { useState, useEffect, useCallback } from 'react';
import scheduleService from '../services/scheduleService';
import { checkScheduleConflict } from '../utils/validationUtils';

/**
 * 일정 관리를 위한 커스텀 훅
 * @param {number} initialYear - 초기 년도
 * @param {number} initialMonth - 초기 월
 * @returns {Object} 일정 관련 상태 및 메소드
 */
const useSchedule = (initialYear, initialMonth) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // 월별 일정 불러오기
  const fetchMonthlySchedules = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await scheduleService.getMonthlySchedules(year, month);
      setSchedules(data);
    } catch (err) {
      setError('일정을 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 초기 데이터 로딩
  useEffect(() => {
    if (initialYear && initialMonth) {
      fetchMonthlySchedules(initialYear, initialMonth);
    }
  }, [initialYear, initialMonth, fetchMonthlySchedules]);
  
  // 일정 생성
  const createSchedule = async (scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      // 일정 중복 체크
      const conflictCheck = checkScheduleConflict(scheduleData, schedules);
      if (conflictCheck.hasConflict) {
        setError(conflictCheck.error || '일정이 중복됩니다.');
        return { success: false, error: conflictCheck.error, conflicts: conflictCheck.conflictSchedules };
      }
      
      const newSchedule = await scheduleService.createSchedule(scheduleData);
      setSchedules(prev => [...prev, newSchedule]);
      return { success: true, schedule: newSchedule };
    } catch (err) {
      setError('일정을 생성하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 일정 수정
  const updateSchedule = async (scheduleId, scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      // 일정 중복 체크 (자기 자신 제외)
      const conflictCheck = checkScheduleConflict(scheduleData, schedules, scheduleId);
      if (conflictCheck.hasConflict) {
        setError(conflictCheck.error || '일정이 중복됩니다.');
        return { success: false, error: conflictCheck.error, conflicts: conflictCheck.conflictSchedules };
      }
      
      const updatedSchedule = await scheduleService.updateSchedule(scheduleId, scheduleData);
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId ? updatedSchedule : schedule
      ));
      return { success: true, schedule: updatedSchedule };
    } catch (err) {
      setError('일정을 수정하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 일정 삭제
  const deleteSchedule = async (scheduleId, deleteOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      await scheduleService.deleteSchedule(scheduleId, deleteOptions);
      setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      return { success: true };
    } catch (err) {
      setError('일정을 삭제하는 중 오류가 발생했습니다.');
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // 특정 날짜의 일정만 필터링
  const getSchedulesByDate = (date) => {
    return schedules.filter(schedule => schedule.date === date);
  };
  
  // 특정 프로젝트의 일정만 필터링
  const getSchedulesByProject = (projectId) => {
    return schedules.filter(
      schedule => schedule.type === 'PROJECT' && schedule.projectId === projectId
    );
  };
  
  // 날짜별 일정 시간 합계 계산 (프로젝트별)
  const calculateTotalHoursByProject = (projectId) => {
    let totalMinutes = 0;
    
    schedules.forEach(schedule => {
      if (schedule.type === 'PROJECT' && schedule.projectId === projectId) {
        const startTime = schedule.startTime.split(':').map(Number);
        const endTime = schedule.endTime.split(':').map(Number);
        
        const startMinutes = startTime[0] * 60 + startTime[1];
        const endMinutes = endTime[0] * 60 + endTime[1];
        
        totalMinutes += (endMinutes - startMinutes);
      }
    });
    
    return totalMinutes / 60; // 시간 단위로 반환
  };
  
  return {
    schedules,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    fetchMonthlySchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDate,
    getSchedulesByProject,
    calculateTotalHoursByProject
  };
};

export default useSchedule;
