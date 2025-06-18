import api from './api';

const exportService = {
  /**
   * 월별 활동일지 내보내기
   * @param {number} year - 내보낼 년도
   * @param {number} month - 내보낼 월 (1-12)
   * @param {string} format - 내보내기 형식 ('csv' 또는 'xlsx')
   * @returns {Promise} 내보내기 결과 (파일 다운로드 URL 또는 Blob)
   */
  exportMonthlyReport: async (year, month, format = 'xlsx') => {
    try {
      const response = await api.get('/export', {
        params: { year, month, format },
        responseType: 'blob',  // 파일 다운로드를 위한 응답 타입 설정
      });
      
      // 파일 다운로드를 위한 처리
      const blob = new Blob([response.data], {
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv'
      });
      
      const fileName = `활동일지_${year}_${month}.${format}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, fileName };
    } catch (error) {
      console.error('활동일지 내보내기 중 오류:', error);
      throw error;
    }
  }
};

export default exportService;
