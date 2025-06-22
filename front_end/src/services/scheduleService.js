import api from './api';
import { addDays, addWeeks, addMonths, format, parse, getDay } from 'date-fns';

// 목업 데이터 제거 - 실제 백엔드 API만 사용
const USE_MOCK_DATA = false;

// 목업용 빈 함수 - 참조 오류 방지
const generateMockSchedules = () => { 
  console.warn('목업 데이터가 삭제되었습니다. 실제 API를 사용해주세요.'); 
  return []; 
};

// 반복 일정 생성을 위한 헬퍼 함수
const generateRecurringSchedules = (baseSchedule, count = 10) => {
  const { repeat } = baseSchedule;
  if (!repeat || !repeat.enabled || !repeat.frequency) return [baseSchedule];
  
  const schedules = [];
  const baseDate = parse(baseSchedule.date, 'yyyy-MM-dd', new Date());
  const baseId = Math.floor(Math.random() * 1000) + 100;
  
  // 기본 일정 추가
  schedules.push({ ...baseSchedule, id: baseId, recurrenceId: baseId });
  
  // 종료 개수
  let maxCount;
  if (repeat.endType === 'count') {
    maxCount = Math.min(repeat.endCount, 100); // 최대 100개로 제한
  } else {
    maxCount = count; // 기본값
  }
  
  // 반복 일정 생성
  let currentDate = baseDate;
  let currentCount = 1;
  
  while (currentCount < maxCount) {
    let nextDate;
    
    switch (repeat.frequency) {
      case 'daily':
        nextDate = addDays(currentDate, repeat.interval);
        break;
      case 'weekly':
        nextDate = addWeeks(currentDate, repeat.interval);
        // 요일 설정이 있으면 해당 요일에만 일정 생성
        if (repeat.days && repeat.days.length > 0) {
          // 요일 확인
          const dayOfWeek = getDay(nextDate).toString();
          if (!repeat.days.includes(dayOfWeek)) {
            currentDate = nextDate;
            continue; // 선택한 요일이 아니면 채우지 않고 다음으로
          }
        }
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, repeat.interval);
        break;
      default:
        return schedules;
    }
    
    // 종료 날짜 확인
    if (repeat.endType === 'date' && repeat.endDate) {
      const endDate = parse(repeat.endDate, 'yyyy-MM-dd', new Date());
      if (nextDate > endDate) {
        break;
      }
    }
    
    // 새 일정 추가
    const newSchedule = {
      ...baseSchedule,
      id: baseId + currentCount,
      recurrenceId: baseId, // 반복 그룹 식별자
      date: format(nextDate, 'yyyy-MM-dd')
    };
    
    schedules.push(newSchedule);
    currentDate = nextDate;
    currentCount++;
  }
  
  return schedules;
};

const scheduleService = {
  /**
   * 특정 프로젝트의 최근 활동 내역 조회
   * @param {number} projectId - 조회할 프로젝트 ID
   * @param {number} limit - 조회할 활동 내역 개수 제한
   * @returns {Promise} 해당 프로젝트의 최근 활동 내역
   */
  getProjectRecentActivities: async (projectId, limit = 5) => {
    try {
      if (USE_MOCK_DATA) {
        // 모의 데이터에서 해당 프로젝트의 일정만 필터링
        const projectSchedules = await generateMockSchedules();
        
        // 해당 프로젝트의 일정만 필터링 및 최근 순으로 정렬
        const activities = projectSchedules
          .filter(schedule => schedule.type === 'PROJECT' && schedule.projectId === projectId)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit)
          .map(schedule => {
            // 최근 3개월 내 날짜 생성
            const today = new Date();
            const randomDaysAgo = Math.floor(Math.random() * 90); // 0~90일 사이 랜덤
            const activityDate = new Date(today);
            activityDate.setDate(today.getDate() - randomDaysAgo);
            
            return {
              id: schedule.id,
              content: schedule.content,
              date: format(activityDate, 'yyyy-MM-dd'),  // 유효한 날짜 포맷 보장
              startTime: schedule.startTime,
              endTime: schedule.endTime
            };
          });
          
        return activities;
      } else {
        // 실제 API 호출 - 접두어 제거
        const response = await api.get('/api/projects/' + projectId + '/activities', {
          params: { limit }
        });
        return response.data;
      }
    } catch (error) {
      console.error('프로젝트 활동 내역 조회 중 오류:', error);
      return [];
    }
  },
  /**
   * 월별 일정 조회
   * @param {number} year - 조회할 년도
   * @param {number} month - 조회할 월 (1-12)
   * @returns {Promise} 해당 월의 일정 목록
   */
  getMonthlySchedules: async (year, month) => {
    try {
      if (USE_MOCK_DATA) {
        console.log('모의 일정 데이터 사용 (백엔드 연동 전)');
        // 모의 데이터 사용
        return generateMockSchedules(year, month);
      } else {
        // 실제 API 호출 - 접두어 제거
        const response = await api.get('/api/schedules', {
          params: { year, month }
        });
        return response.data;
      }
    } catch (error) {
      console.error('월별 일정 조회 중 오류:', error);
      if (USE_MOCK_DATA) {
        // 오류 발생 시 기본 모의 데이터 반환
        return generateMockSchedules(year, month);
      }
      throw error;
    }
  },

  /**
   * 새 일정 생성
   * @param {Object} scheduleData - 생성할 일정 데이터
   * @returns {Promise} 생성된 일정 정보 또는 반복 일정인 경우 일정 목록
   */
  createSchedule: async (scheduleData) => {
    try {
      if (USE_MOCK_DATA) {
        // 반복 설정이 있는지 확인
        const hasRecurrence = scheduleData.repeat && 
                            scheduleData.repeat.enabled && 
                            scheduleData.repeat.frequency;
        
        if (hasRecurrence) {
          // 반복 일정 생성
          console.log('반복 일정 생성 (백엔드 연동 전)');
          const recurringSchedules = generateRecurringSchedules(scheduleData);
          
          // 일정 목록과 최초 일정 객체 반환
          return {
            schedules: recurringSchedules,
            mainSchedule: recurringSchedules[0]
          };
        } else {
          // 일반 일정 생성
          const mockId = Math.floor(Math.random() * 1000) + 100;
          const createdSchedule = { ...scheduleData, id: mockId };
          console.log('일정 생성 성공 (모의 데이터):', createdSchedule);
          return { mainSchedule: createdSchedule, schedules: [createdSchedule] };
        }
      } else {
        // 실제 API 호출 - 백엔드에서 처리하도록 함
        const response = await api.post('/api/schedules', scheduleData);
        console.log('일정 생성 성공:', response.data);
        return response.data;
      }
    } catch (error) {
      console.log('일정 생성 오류 발생:', error);
      console.log('오류 응답 객체:', error.response);
      
      if (error.response) {
        console.log('오류 상태 코드:', error.response.status);
        console.log('오류 데이터:', error.response.data);
        
        // 409 Conflict - 일정 충돌
        if (error.response.status === 409) {
          console.log('409 충돌 오류 감지');
          const errorMessage = error.response.data?.message || '해당 시간에 이미 일정이 존재합니다.';
          const conflictDetails = error.response.data?.conflictSchedules || [];
          console.log('오류 메시지:', errorMessage);
          console.log('충돌 일정 상세:', conflictDetails);
          
          let detailedMessage = `일정 중복: ${errorMessage}`;
          
          if (conflictDetails.length > 0) {
            const conflictNames = conflictDetails.map(s => `'${s.title}' (${s.startTime.substring(0, 5)}~${s.endTime.substring(0, 5)})`);
            detailedMessage += `\n\n충돌 일정: ${conflictNames.join(', ')}`;
            console.log('상세 오류 메시지 생성:', detailedMessage);
          }
          
          throw new Error(detailedMessage);
        }
        
        // 400 Bad Request - 유효성 오류
        if (error.response.status === 400) {
          const errorMessage = error.response.data?.message || '입력하신 일정 데이터가 유효하지 않습니다.';
          throw new Error(`유효성 오류: ${errorMessage}`);
        }

        // 403 Forbidden - 권한 오류
        if (error.response.status === 403) {
          throw new Error('일정을 생성할 권한이 없습니다. 다시 로그인해주세요.');
        }
        
        // 그 외 오류
        throw new Error(error.response.data?.message || '알 수 없는 오류가 발생했습니다.');
      }
      
      throw error;
    }
  },

  /**
   * 일정 정보 수정
   * @param {number} scheduleId - 수정할 일정 ID
   * @param {Object} scheduleData - 수정할 일정 데이터
   * @returns {Promise} 수정된 일정 정보
   */
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      if (USE_MOCK_DATA) {
        // 모의 데이터 업데이트 (실제로는 저장되지 않음)
        return { ...scheduleData, id: scheduleId };
      } else {
        const response = await api.put(`/api/schedules/${scheduleId}`, scheduleData);
        return response.data;
      }
    } catch (error) {
      console.error('일정 수정 중 오류:', error);
      throw error;
    }
  },

  /**
   * 일정 삭제
   * @param {number} scheduleId - 삭제할 일정 ID
   * @param {Object} deleteOptions - 삭제 옵션 (반복 일정 삭제 범위 지정)
   * @returns {Promise} 삭제 결과
   */
  deleteSchedule: async (scheduleId, deleteOptions = {}) => {
    try {
      if (USE_MOCK_DATA) {
        // 모의 데이터 삭제 (실제로는 삭제되지 않음)
        return { success: true };
      } else {
        const response = await api.delete(`/api/schedules/${scheduleId}`, {
          data: deleteOptions
        });
        return response.data;
      } 
    } catch (error) {
      console.error('일정 삭제 중 오류:', error);
      throw error;
    }
  },

  /**
   * 일정 중복 확인
   * @param {Object} scheduleData - 확인할 일정 데이터
   * @returns {Promise} 중복 여부 및 중복된 일정
   */
  checkConflict: async (scheduleData) => {
    try {
      // 실제로는 서버 API를 통해 확인하지만, 백엔드 연동 전까지는 클라이언트에서 처리
      // 나중에 '/schedules/check-conflict' 같은 엔드포인트로 구현 예정
      return { hasConflict: false, conflictSchedules: [] };
    } catch (error) {
      console.error('일정 중복 확인 중 오류:', error);
      throw error;
    }
  }
};

export default scheduleService;
