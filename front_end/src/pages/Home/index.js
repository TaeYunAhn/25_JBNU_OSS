import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // 현재부터 과거 5년, 미래 3년까지의 선택지
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/calendar/${selectedYear}/${selectedMonth}`);
  };

  return (
    <div className="home-container">
      <div className="year-month-selector">
        <h1>소중대 활동일지 캘린더</h1>
        <p>활동일지를 작성할 년도와 월을 선택하세요</p>
        
        <form onSubmit={handleSubmit} className="selector-form">
          <div className="selector-group">
            <div className="form-group">
              <label htmlFor="year" className="form-label">년도</label>
              <select 
                id="year" 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-control"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="month" className="form-label">월</label>
              <select 
                id="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="form-control"
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">캘린더 열기</button>
        </form>
      </div>
    </div>
  );
}

export default Home;
