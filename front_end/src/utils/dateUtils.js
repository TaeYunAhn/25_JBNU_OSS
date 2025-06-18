/**
 * 날짜 및 시간 관련 유틸리티 함수
 */

/**
 * 시간 문자열을 분으로 변환 (예: "10:30" -> 630)
 * @param {string} timeString - HH:MM 형식의 시간 문자열
 * @returns {number} 분 단위 시간
 */
export const timeStringToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 분을 시간 문자열로 변환 (예: 630 -> "10:30")
 * @param {number} minutes - 분 단위 시간
 * @returns {string} HH:MM 형식의 시간 문자열
 */
export const minutesToTimeString = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * 두 시간 사이의 시간 차이를 분으로 계산
 * @param {string} startTime - 시작 시간 (HH:MM)
 * @param {string} endTime - 종료 시간 (HH:MM)
 * @returns {number} 분 단위 시간 차이
 */
export const calculateDurationMinutes = (startTime, endTime) => {
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  return endMinutes - startMinutes;
};

/**
 * 분 단위 시간을 시간과 분 문자열로 변환 (예: 90 -> "1시간 30분")
 * @param {number} minutes - 분 단위 시간
 * @returns {string} 시간과 분 형식의 문자열
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  let result = '';
  if (hours > 0) result += `${hours}시간 `;
  if (mins > 0 || hours === 0) result += `${mins}분`;
  
  return result.trim();
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 * @param {Date} date - Date 객체
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
export const formatDateYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 변환
 * @param {Date|string} date - Date 객체 또는 YYYY-MM-DD 문자열
 * @returns {string} YYYY년 MM월 DD일 형식의 문자열
 */
export const formatDateKorean = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 해당 월의 일수 계산
 * @param {number} year - 년도
 * @param {number} month - 월 (1-12)
 * @returns {number} 해당 월의 일수
 */
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * 해당 일자의 요일 이름 반환 (일, 월, 화, ...)
 * @param {Date|string} date - Date 객체 또는 YYYY-MM-DD 문자열
 * @returns {string} 요일 이름
 */
export const getDayOfWeekName = (date) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return weekdays[dateObj.getDay()];
};
