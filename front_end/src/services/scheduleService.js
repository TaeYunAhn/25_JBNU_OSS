import api from './api';
import generateMockSchedules from '../mocks/data/schedules';

// 캘린더 디자인 및 테스트를 위한 모의 데이터 사용 여부
const USE_MOCK_DATA = true;

const scheduleService = {
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
        // 실제 API 호출
        const response = await api.get('/schedules', {
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
   * @returns {Promise} 생성된 일정 정보
   */
  createSchedule: async (scheduleData) => {
    try {
      if (USE_MOCK_DATA) {
        // 모의 데이터 생성 (실제로는 저장되지 않음)
        const mockId = Math.floor(Math.random() * 1000) + 100;
        return { ...scheduleData, id: mockId };
      } else {
        const response = await api.post('/schedules', scheduleData);
        return response.data;
      }
    } catch (error) {
      console.error('일정 생성 중 오류:', error);
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
        const response = await api.put(`/schedules/${scheduleId}`, scheduleData);
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
        const response = await api.delete(`/schedules/${scheduleId}`, {
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
