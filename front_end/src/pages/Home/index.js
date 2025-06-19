import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import logo from '../../assets/images/logo_main.png';

function Home() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // 월 이름 배열
  const months = [
    '1월', '2월', '3월', '4월', 
    '5월', '6월', '7월', '8월', 
    '9월', '10월', '11월', '12월'
  ];

  // 이전/다음 년도로 이동
  const changeYear = (increment) => {
    setSelectedYear(prev => prev + increment);
  };

  // 월 선택
  const selectMonth = (month) => {
    setSelectedMonth(month);
  };

  // 일지 작성 페이지로 이동
  const goToCalendar = () => {
    navigate(`/calendar/${selectedYear}/${selectedMonth}`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="logo-container">
          <img src={logo} alt="Callog" className="callog-logo" />
        </div>
      </div>
      
      <div className="home-content">
        <div className="welcome-text">
          <h1>안녕하세요, Callog입니다 :)</h1>
          <p>작성을 원하는 일지의 년도와 월을 선택해주세요!</p>
        </div>
        
        <div className="year-selector">
          <button 
            type="button" 
            className="year-nav-btn"
            onClick={() => changeYear(-1)}
            aria-label="이전 년도"
          >
            &lt;
          </button>
          
          <div className="selected-year">{selectedYear}</div>
          
          <button 
            type="button" 
            className="year-nav-btn"
            onClick={() => changeYear(1)}
            aria-label="다음 년도"
          >
            &gt;
          </button>
        </div>
        
        <div className="month-grid">
          {months.map((monthName, index) => {
            const monthNumber = index + 1;
            return (
              <button
                key={monthNumber}
                type="button"
                className={`month-btn ${monthNumber === selectedMonth ? 'selected' : ''}`}
                onClick={() => selectMonth(monthNumber)}
              >
                {monthName}
              </button>
            );
          })}
        </div>
        
        <button 
          type="button"
          className="calendar-btn"
          onClick={goToCalendar}
        >
          일지 작성하러 가기
        </button>
      </div>
    </div>
  );
}

export default Home;
