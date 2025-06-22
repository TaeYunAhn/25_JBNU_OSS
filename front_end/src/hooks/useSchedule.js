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
      // 반복 일정이 있는지 확인
      const isRecurring = scheduleData.repeat && 
                          scheduleData.repeat.enabled && 
                          scheduleData.repeat.frequency;
                          
      // 반복이 아닌 일반 일정의 중복 체크
      if (!isRecurring) {
        const conflictCheck = checkScheduleConflict(scheduleData, schedules);
        if (conflictCheck.hasConflict) {
          setError(conflictCheck.error || '일정이 중복됩니다.');
          throw new Error(conflictCheck.error || '일정이 중복됩니다.');
        }
      }
      
      // 일정 생성
      const result = await scheduleService.createSchedule(scheduleData);
      
      if (isRecurring) {
        // 반복 일정의 경우 - 여러 일정이 생성됨
        const { schedules: newSchedules, mainSchedule } = result;
        setSchedules(prev => [...prev, ...newSchedules]);
        return { success: true, schedule: mainSchedule, recurringSchedules: newSchedules };
      } else {
        // 일반 일정의 경우
        const { mainSchedule } = result;
        setSchedules(prev => [...prev, mainSchedule]);
        return { success: true, schedule: mainSchedule };
      }
    } catch (err) {
      setError('일정을 생성하는 중 오류가 발생했습니다.');
      console.error(err);
      setLoading(false);
      throw err; // 오류를 위로 전파하여 상위에서 처리하게 함
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
        throw new Error(conflictCheck.error || '일정이 중복됩니다.');
      }
      
      const updatedSchedule = await scheduleService.updateSchedule(scheduleId, scheduleData);
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId ? updatedSchedule : schedule
      ));
      return { success: true, schedule: updatedSchedule };
    } catch (err) {
      setError('일정을 수정하는 중 오류가 발생했습니다.');
      console.error(err);
      setLoading(false);
      throw err; // 오류를 위로 전파하여 상위에서 처리하게 함
    } finally {
      setLoading(false);
    }
  };
  
  // 일정 삭제
  const deleteSchedule = async (scheduleId, deleteOptions = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // 삭제할 일정 찾기
      const scheduleToDelete = schedules.find(s => s.id === scheduleId);
      
      // 반복 일정 처리
      if (scheduleToDelete && scheduleToDelete.recurrenceId) {
        // 반복 일정 전체 삭제 옵션 확인
        if (deleteOptions.deleteAllRecurrences) {
          const recurrenceId = scheduleToDelete.recurrenceId;
          await scheduleService.deleteSchedule(scheduleId, { deleteAllRecurrences: true });
          
          // 같은 recurrenceId를 가진 모든 일정 삭제
          setSchedules(prev => prev.filter(s => s.recurrenceId !== recurrenceId));
        } else {
          // 현재 일정만 삭제
          await scheduleService.deleteSchedule(scheduleId, { deleteAllRecurrences: false });
          setSchedules(prev => prev.filter(s => s.id !== scheduleId));
        }
      } else {
        // 일반 일정 삭제 
        await scheduleService.deleteSchedule(scheduleId);
        setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      }
      
      return { success: true };
    } catch (err) {
      setError('일정을 삭제하는 중 오류가 발생했습니다.');
      console.error(err);
      setLoading(false);
      throw err; // 오류를 위로 전파하여 상위에서 처리하게 함
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
  
  // 특정 프로젝트의 최근 활동 내역 조회
  const getProjectRecentActivities = async (projectId, limit = 5) => {
    try {
      const activities = await scheduleService.getProjectRecentActivities(projectId, limit);
      return activities;
    } catch (err) {
      console.error('프로젝트 활동 내역 조회 중 오류:', err);
      return [];
    }
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
    calculateTotalHoursByProject,
    getProjectRecentActivities
  };
};

export default useSchedule;
