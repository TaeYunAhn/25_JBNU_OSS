import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import ScheduleModal from '../../components/calendar/ScheduleModal';
import ProjectList from '../../components/project/ProjectList';
import ProjectModal from '../../components/project/ProjectModal';
import useSchedule from '../../hooks/useSchedule';
import useProject from '../../hooks/useProject';
import exportService from '../../services/exportService';
import './Calendar.css';

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
    const selectedDate = new Date(selectInfo.start);
    
    setScheduleModal({
      isOpen: true,
      mode: 'create',
      selectedSchedule: null,
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
      <div className="calendar-sidebar">
        <h2 className="page-title">프로젝트 관리</h2>
        
        <ProjectList 
          projects={projects}
          onProjectClick={() => {}}
          onAddProject={handleAddProject}
          onEditProject={handleProjectEdit}
        />
        
        <div className="export-section">
          <h3>월별 활동내역</h3>
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
            events={schedules.map(schedule => ({
              id: schedule.id.toString(),
              title: schedule.title,
              start: schedule.start || `${schedule.date}T${schedule.startTime}`,
              end: schedule.end || `${schedule.date}T${schedule.endTime}`,
              backgroundColor: schedule.type === 'PROJECT' ? '#4a6cf7' : '#e74c3c',
              classNames: schedule.type === 'PROJECT' ? ['project-event'] : ['inactive-event']
            }))}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            locale="ko"
            allDaySlot={false}
            slotMinTime="08:00:00"
            slotMaxTime="22:00:00"
            height="auto"
          />
        </div>
      </div>
      
      {/* 일정 모달 */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        mode={scheduleModal.mode}
        schedule={scheduleModal.selectedSchedule}
        selectedDate={scheduleModal.selectedDate}
        projects={projects}
        onSubmit={handleScheduleSubmit}
        onDelete={handleScheduleDelete}
        onClose={closeScheduleModal}
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
