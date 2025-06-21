import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import ScheduleModal from '../../components/calendar/ScheduleModal';
import ProjectList from '../../components/project/ProjectList';
import ProjectModal from '../../components/project/ProjectModal';
import useSchedule from '../../hooks/useSchedule';
import useProject from '../../hooks/useProject';
import exportService from '../../services/exportService';
import './Calendar.css';
import logoImage from '../../assets/images/logo_main.png';

function Calendar() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  
  // 커스텀 훅 사용
  const { 
    schedules, 
    fetchMonthlySchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    isLoading: scheduleLoading 
  } = useSchedule();
  
  const { 
    projects, 
    fetchProjects,
    createProject,
    updateProject,
    isLoading: projectLoading 
  } = useProject();
  
  // 로컬 상태
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    mode: 'view', // 'view', 'create', 'edit'
    selectedSchedule: null,
    selectedDate: null
  });
  const [projectModal, setProjectModal] = useState({
    isOpen: false,
    mode: 'create', // 'create', 'edit'
    selectedProject: null
  });
  
  // 캘린더 초기 날짜 설정
  const initialDate = year && month ? `${year}-${month.padStart(2, '0')}-01` : new Date();
  
  // 초기 데이터 로드
  useEffect(() => {
    fetchProjects();
    if (year && month) {
      fetchMonthlySchedules(parseInt(year), parseInt(month));
    }
  }, []);
  
  // 월 변경시 일정 데이터 다시 로드
  useEffect(() => {
    if (year && month) {
      fetchMonthlySchedules(parseInt(year), parseInt(month));
      // URL과 현재 날짜 동기화
      setCurrentDate(new Date(`${year}-${month.padStart(2, '0')}-01`));
    }
  }, [year, month]);
  
  // 일정 클릭 시 상세 정보 표시
  const handleEventClick = (info) => {
    const id = parseInt(info.event.id);
    const clickedSchedule = schedules.find(schedule => schedule.id === id);
    
    if (clickedSchedule) {
      setScheduleModal({
        isOpen: true,
        mode: 'view',
        selectedSchedule: clickedSchedule,
        selectedDate: null
      });
    }
  };
  
  // 새 일정 생성 모달 열기
  const handleDateSelect = (selectInfo) => {
    // 선택한 정확한 날짜와 시간을 가져오기
    const selectedDate = new Date(selectInfo.start);
    const selectedEndDate = new Date(selectInfo.end);
    
    // 시간 정보 추출
    const startHour = selectedDate.getHours().toString().padStart(2, '0');
    const startMinute = selectedDate.getMinutes().toString().padStart(2, '0');
    const endHour = selectedEndDate.getHours().toString().padStart(2, '0');
    const endMinute = selectedEndDate.getMinutes().toString().padStart(2, '0');
    
    // 시간 문자열 포맷팅
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    
    // 드래그 선택 완료된 날짜와 시간 정보를 모달에 전달
    setScheduleModal({
      isOpen: true,
      mode: 'create',
      selectedSchedule: {
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: startTime,
        endTime: endTime
      },
      selectedDate
    });
  };
  
  // 새 일정 추가 버튼 클릭
  const handleAddSchedule = () => {
    setScheduleModal({
      isOpen: true,
      mode: 'create',
      selectedSchedule: null,
      selectedDate: new Date()
    });
  };
  
  // 일정 제출 핸들러 (생성/수정)
  const handleScheduleSubmit = (scheduleData, scheduleId) => {
    if (scheduleId) {
      // 기존 일정 수정
      updateSchedule(scheduleId, scheduleData)
        .then(() => {
          closeScheduleModal();
        })
        .catch(error => {
          console.error('일정 수정 실패:', error);
          alert('일정 수정 중 오류가 발생했습니다.');
        });
    } else {
      // 새 일정 생성
      createSchedule(scheduleData)
        .then(() => {
          closeScheduleModal();
        })
        .catch(error => {
          console.error('일정 생성 실패:', error);
          alert('일정 생성 중 오류가 발생했습니다.');
        });
    }
  };
  
  // 일정 삭제 핸들러
  const handleScheduleDelete = (scheduleId) => {
    deleteSchedule(scheduleId)
      .then(() => {
        closeScheduleModal();
      })
      .catch(error => {
        console.error('일정 삭제 실패:', error);
        alert('일정 삭제 중 오류가 발생했습니다.');
      });
  };
  
  // 일정 모달 닫기
  const closeScheduleModal = () => {
    setScheduleModal({
      isOpen: false,
      mode: 'view',
      selectedSchedule: null,
      selectedDate: null
    });
  };
  
  // 새 프로젝트 추가 버튼 클릭
  const handleAddProject = () => {
    setProjectModal({
      isOpen: true,
      mode: 'create',
      selectedProject: null
    });
  };
  
  // 프로젝트 수정 버튼 클릭
  const handleProjectEdit = (project) => {
    setProjectModal({
      isOpen: true,
      mode: 'edit',
      selectedProject: project
    });
  };
  
  // 프로젝트 제출 핸들러 (생성/수정)
  const handleProjectSubmit = (projectData, projectId) => {
    if (projectId) {
      // 기존 프로젝트 수정
      updateProject(projectId, projectData)
        .then(() => {
          closeProjectModal();
        })
        .catch(error => {
          console.error('프로젝트 수정 실패:', error);
          alert('프로젝트 수정 중 오류가 발생했습니다.');
        });
    } else {
      // 새 프로젝트 생성
      createProject(projectData)
        .then(() => {
          closeProjectModal();
        })
        .catch(error => {
          console.error('프로젝트 생성 실패:', error);
          alert('프로젝트 생성 중 오류가 발생했습니다.');
        });
    }
  };
  
  // 프로젝트 모달 닫기
  const closeProjectModal = () => {
    setProjectModal({
      isOpen: false,
      mode: 'create',
      selectedProject: null
    });
  };
  
  // 날짜 변경 핸들러
  const handleMonthChange = (info) => {
    const newDate = info.view.currentStart;
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth() + 1;
    
    // URL 업데이트
    navigate(`/calendar/${newYear}/${newMonth}`);
    // 현재 날짜 상태 업데이트
    setCurrentDate(newDate);
  };
  
  // 내보내기 핸들러
  const handleExport = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // CSV로 내보내기
    exportService.exportMonthlyActivityLog(year, month, 'csv')
      .catch(error => {
        console.error('활동일지 내보내기 실패:', error);
        alert('활동일지 내보내기 중 오류가 발생했습니다.');
      });
  };
  
  // 이전, 다음, 오늘 버튼 핸들러
  const handlePrevMonth = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };
  
  const handleNextMonth = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };
  
  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };
  
  // 뷰 변경 핸들러
  const handleViewChange = (viewType) => {
    setCalendarView(viewType === 'month' ? 'dayGridMonth' : 
                   viewType === 'week' ? 'timeGridWeek' : 'timeGridDay');
    
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(
      viewType === 'month' ? 'dayGridMonth' : 
      viewType === 'week' ? 'timeGridWeek' : 'timeGridDay'
    );
  };
  
  // 랜더링
  return (
    <div className="calendar-page">
      {/* 상단 네비게이션 바 */}
      <div className="top-nav-bar">
        <div className="logo-container">
          <img src={logoImage} alt="소중대 활동일지" />
        </div>
        <div className="user-info">
          <div className="user-name">테스트 사용자님</div>
          <div className="user-avatar">U</div>
        </div>
      </div>
      
      {/* 캘린더 콘텐츠 영역 */}
      <div className="calendar-content">
        <div className="calendar-sidebar">
          <div className="sidebar-action-buttons">
            <button className="btn-add-project" onClick={handleAddProject}>
              프로젝트 추가 <i className="fas fa-plus"></i>
            </button>
            <button className="btn-add-schedule" onClick={handleAddSchedule}>
              일정 추가 <i className="fas fa-plus"></i>
            </button>
          </div>
          
          <ProjectList 
            projects={projects}
            onProjectClick={() => {}}
            onAddProject={handleAddProject}
            onEditProject={handleProjectEdit}
          />
          
          <div className="export-section">
            <button 
              className="btn-export" 
              onClick={handleExport}
              disabled={projectLoading || scheduleLoading}
            >
              활동일지 내보내기
            </button>
          </div>
        </div>
        
        <div className="calendar-main">
          {/* 캘린더 툴바 */}
          <CalendarToolbar
            currentDate={currentDate}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            onToday={handleToday}
            view={calendarView === 'dayGridMonth' ? 'month' : 
                  calendarView === 'timeGridWeek' ? 'week' : 'day'}
            onViewChange={handleViewChange}
            onAddSchedule={handleAddSchedule}
            onExport={handleExport}
          />
          
          {/* 캘린더 */}
          <div className="calendar-container">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={calendarView}
              initialDate={initialDate}
              headerToolbar={false} // 커스텀 툴바 사용
            selectConstraint={{ // 하루를 넘어가는 드래그 선택 제한
              startTime: '00:00',
              endTime: '24:00',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // 모든 요일
            }}
            selectAllow={(selectInfo) => {
              // 하루를 넘기지 않도록 제한
              const startDate = new Date(selectInfo.start).setHours(0, 0, 0, 0);
              const endDate = new Date(selectInfo.end).setHours(0, 0, 0, 0);
              return startDate === endDate;
            }}
            events={schedules && Array.isArray(schedules) ? schedules.map(schedule => {
              // 프로젝트 색상 찾기
              let backgroundColor = '#e74c3c'; // 기본 색상 (비활동 일정)
              
              if (schedule.type === 'PROJECT' && schedule.projectId) {
                const project = projects.find(p => p.id === schedule.projectId);
                if (project && project.color) {
                  backgroundColor = project.color;
                } else {
                  backgroundColor = '#4a6cf7'; // 프로젝트 기본 색상
                }
              }
              
              return {
                id: schedule.id.toString(),
                title: schedule.title,
                start: schedule.start || `${schedule.date}T${schedule.startTime}`,
                end: schedule.end || `${schedule.date}T${schedule.endTime}`,
                backgroundColor: backgroundColor,
                classNames: schedule.type === 'PROJECT' ? ['project-event'] : ['inactive-event']
              };
            }) : []}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            datesSet={handleMonthChange}
            locale="ko"
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            selectOverlap={true} // 기존 이벤트와 겹쳐도 선택 가능
          />
        </div>
      </div>
      
      </div>
      
      {/* 일정 모달 */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        mode={scheduleModal.mode}
        onSubmit={handleScheduleSubmit}
        onDelete={handleScheduleDelete}
        onClose={closeScheduleModal}
        schedule={scheduleModal.selectedSchedule} 
        initialDate={scheduleModal.selectedDate}
        projects={projects}
      />
      
      {/* 프로젝트 모달 */}
      <ProjectModal
        isOpen={projectModal.isOpen}
        mode={projectModal.mode}
        project={projectModal.selectedProject}
        onSubmit={handleProjectSubmit}
        onClose={closeProjectModal}
      />
    </div>
  );
}

export default Calendar;
