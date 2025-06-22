import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import useAuth from '../../hooks/useAuth';
import exportService from '../../services/exportService';
import projectService from '../../services/projectService';
import { useToast } from '../../contexts/ToastContext';
import './Calendar.css';
import logoImage from '../../assets/images/logo_main.png';

function Calendar() {
  const { year, month } = useParams();
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const { user, logout: authLogout } = useAuth(); // user 객체 추가
  const { showToast } = useToast(); // 토스트 알림 훅 사용
  
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
    deleteProject,
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
  
  // 프로젝트별 월별 통계 데이터 상태 관리
  const [projectStats, setProjectStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(false);
  
  // 일정 변경 시 프로젝트 상세 정보 새로고침을 위한 트리거 값
  const [scheduleRefreshTrigger, setScheduleRefreshTrigger] = useState(0);
  
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
  
  // 월별 프로젝트 통계 데이터 조회
  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!projects || projects.length === 0 || !year || !month) {
        return;
      }

      setStatsLoading(true);
      try {
        const statsPromises = projects.map(project => 
          projectService.getProjectMonthlyStats(project.id, year, month)
        );
        
        const results = await Promise.all(statsPromises);
        
        const newStats = {};
        results.forEach(stat => {
          if (stat && stat.projectId) {
            newStats[stat.projectId] = stat;
          }
        });
        setProjectStats(newStats);
      } catch (error) {
        console.error('프로젝트 월별 통계 조회 중 오류:', error);
        setProjectStats({}); // 오류 발생 시 초기화
      } finally {
        setStatsLoading(false);
      }
    };

    fetchProjectStats();
  }, [projects, year, month, scheduleRefreshTrigger]);
  
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
  const handleScheduleSubmit = useCallback(async (scheduleData, scheduleId) => {
    console.log('일정 제출 핸들러 호출됨:', { scheduleData, scheduleId });
    try {
      if (scheduleId) {
        console.log('기존 일정 수정 시도...');
        // 기존 일정 수정
        const result = await updateSchedule(scheduleId, scheduleData);
        console.log('일정 수정 결과:', result);
        
        // 프로젝트 목록 새로고침 (프로젝트 진행률 업데이트를 위해)
        if (scheduleData.type === 'PROJECT' && scheduleData.projectId) {
          console.log('프로젝트 관련 일정이 수정됨. 프로젝트 목록 새로고침...');
          await fetchProjects();
          // 프로젝트 상세 정보 새로고침을 위한 트리거 값 증가
          setScheduleRefreshTrigger(prev => prev + 1);
        }
        
        // 성공 시 토스트 메시지 표시
        if (result && result.success) {
          showToast(`'${scheduleData.title}' 일정이 수정되었습니다.`, 'success');
        }
        return result; // 성공/실패 정보 반환
      } else {
        console.log('새 일정 생성 시도...');
        // 새 일정 생성
        const result = await createSchedule(scheduleData);
        console.log('일정 생성 결과:', result);
        
        // 프로젝트 목록 새로고침 (프로젝트 진행률 업데이트를 위해)
        if (scheduleData.type === 'PROJECT' && scheduleData.projectId) {
          console.log('프로젝트 관련 일정이 생성됨. 프로젝트 목록 새로고침...');
          await fetchProjects();
          // 프로젝트 상세 정보 새로고침을 위한 트리거 값 증가
          setScheduleRefreshTrigger(prev => prev + 1);
        }
        
        // 성공 시 토스트 메시지 표시
        if (result && result.success) {
          showToast(`'${scheduleData.title}' 일정이 생성되었습니다.`, 'success');
        }
        return result; // 성공/실패 정보 반환
      }
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error);
      // 오류 시 토스트 메시지 표시
      const errorMsg = error.message || '일정 저장 중 오류가 발생했습니다.';
      showToast(errorMsg, 'error');
      throw error; // 오류를 호출자에게 전파
    }
  }, [updateSchedule, createSchedule, showToast, fetchProjects, setScheduleRefreshTrigger]);
  
  // 일정 삭제 핸들러
  const handleScheduleDelete = useCallback(async (scheduleId) => {
    // ScheduleModal 컴포넌트에서 확인 창을 표시하므로 여기서는 바로 삭제 처리
    
      try {
        // 삭제 전에 일정 정보 가져오기 (제목 표시용 및 프로젝트 정보 확인용)
        const targetSchedule = schedules.find(s => s.id === scheduleId);
        const scheduleName = targetSchedule ? targetSchedule.title : '선택한 일정';
        const isProjectSchedule = targetSchedule && targetSchedule.type === 'PROJECT' && targetSchedule.projectId;
        
        const result = await deleteSchedule(scheduleId);
        
        // 프로젝트 관련 일정이었다면 프로젝트 목록 갱신
        if (isProjectSchedule) {
          console.log('프로젝트 관련 일정이 삭제됨. 프로젝트 목록 새로고침...');
          await fetchProjects();
          // 프로젝트 상세 정보 새로고침을 위한 트리거 값 증가
          setScheduleRefreshTrigger(prev => prev + 1);
        }
        
        if (result && result.success) {
          showToast(`'${scheduleName}' 일정이 삭제되었습니다.`, 'success');
        }
      } catch (error) {
        console.error('일정 삭제 중 오류 발생:', error);
        showToast('일정 삭제 중 오류가 발생했습니다.', 'error');
      }
  }, [deleteSchedule, schedules, showToast, fetchProjects, setScheduleRefreshTrigger]);
  
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
  const Modal
  Edit = (project) => {
    setProjectModal({
      isOpen: true,
      mode: 'edit',
      selectedProject: project
    });
  };
  
  // 프로젝트 클릭 핸들러 - 상세보기 모달 표시
  const handleProjectClick = (projectId) => {
    const clickedProject = projects.find(project => project.id === projectId);
    if (clickedProject) {
      setProjectModal({
        isOpen: true,
        mode: 'view',
        selectedProject: clickedProject
      });
    }
  };
  
  // 프로젝트 제출 핸들러 (생성/수정)
  const handleProjectSubmit = async (projectData, projectId) => {
    try {
      if (projectId) {
        console.log('프로젝트 수정:', projectData);
        await updateProject(projectId, projectData);
        await fetchProjects(); // 프로젝트 목록 다시 로드
      } else {
        console.log('새 프로젝트 생성:', projectData);
        await createProject(projectData);
        await fetchProjects(); // 프로젝트 목록 다시 로드
      }
      return true;
    } catch (error) {
      console.error('프로젝트 저장 중 오류 발생:', error);
      throw error; // 오류를 상위로 전파
    }
  };
  
  // 프로젝트 삭제 핸들러
  const handleProjectDelete = async (projectId) => {
    try {
      const result = await deleteProject(projectId); // useProject 훅의 deleteProject 호출
      
      if (result && result.success) {
        showToast('프로젝트가 성공적으로 삭제되었습니다.', 'success');
        closeProjectModal(); // 모달 닫기
        await fetchProjects(); // 목록 새로고침 (선택적)
      } else {
        showToast('프로젝트 삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('프로젝트 삭제 중 오류 발생:', error);
      const errorMsg = error.response?.data?.message || '프로젝트 삭제 중 오류가 발생했습니다.';
      showToast(errorMsg, 'error');
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
  
  // 프로젝트모달 페헤처
  const handleProjectModalClose = () => {
    setProjectModal({
      isOpen: false,
      mode: '',
      projectId: null
    });
  };
  
  // 로그아웃 핸들러
  const handleLogout = () => {
    authLogout(); // 토큰 삭제
    showToast('로그아웃되었습니다.', 'success');
    navigate('/login'); // 로그인 페이지로 이동
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
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    // 현재 월에 해당하는 활성 프로젝트 필터링
    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0);

    const activeProjectsInMonth = projects.filter(project => {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      return projectStart <= endOfMonth && projectEnd >= startOfMonth;
    });

    if (activeProjectsInMonth.length === 0) {
      showToast('내보내기할 활성 프로젝트가 없습니다.', 'info');
      return;
    }

    exportService.exportMonthlyActivityLog(yearNum, monthNum, 'xlsx')
      .then(() => {
        showToast('활동일지가 성공적으로 다운로드되었습니다.', 'success');
      })
      .catch((error) => {
        showToast('활동일지 다운로드 중 오류가 발생했습니다.', 'error');
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
        <div 
          className="logo-container" 
          onClick={() => navigate('/calendar')}
          style={{ cursor: 'pointer' }}
        >
          <img src={logoImage} alt="소중대 활동일지" />
        </div>
        <div className="user-info">
          <div className="user-name-container">
            <div className="user-name">{user?.fullName || user?.username || '사용자'}님</div>
          </div>
          <button className="logout-button-visible" onClick={handleLogout}>로그아웃</button>
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
            onProjectClick={handleProjectClick}
            onAddProject={handleAddProject}
            onEditProject={handleProjectEdit}
            selectedProjectId={null}
            year={parseInt(year) || currentDate.getFullYear()}
            month={parseInt(month) || currentDate.getMonth() + 1}
            refreshTrigger={scheduleRefreshTrigger}
            projectStats={projectStats}
            loading={statsLoading || projectLoading}
          />
          
          <div className="export-section">
            <button 
              className="btn-export" 
              onClick={handleExport}
              disabled={projectLoading || scheduleLoading || statsLoading}
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
              eventDidMount={(info) => {
                const { event } = info;
                const type = event.classNames.includes('inactive-event') ? 'INACTIVE' : 'PROJECT';
                
                // 색상 설정
                let eventColor = '#CCCCCC';
                if (type === 'INACTIVE') {
                  eventColor = '#CCCCCC';
                } else {
                  eventColor = event.backgroundColor;
                }
                
                // 이벤트 요소에 색상 적용
                info.el.style.backgroundColor = eventColor;
                info.el.style.borderColor = eventColor;
                info.el.style.color = 'white';
                
                // 시간 텍스트에도 색상 적용 (주간/일간 뷰)
                const timeEl = info.el.querySelector('.fc-event-time');
                if (timeEl) {
                  timeEl.style.color = 'white';
                  timeEl.style.fontWeight = '500';
                }
                
                // 월별 뷰에서만 시간 정보 제거
                if (info.view.type === 'dayGridMonth') {
                  const titleEl = info.el.querySelector('.fc-event-title');
                  if (titleEl) {
                    // 시간 형식 패턴 제거
                    const title = titleEl.textContent;
                    
                    // 여러 가지 시간 형식 패턴 처리
                    let cleanTitle = title;
                    
                    // "(오전/오후) N시" 패턴 제거
                    cleanTitle = cleanTitle.replace(/^(\s*(\uC624\uC804|\uC624\uD6C4)\s*\d{1,2}\s*\uC2DC(\s*\d{1,2}\s*\uBD84)?\s*)/, '');
                    
                    // "N:NN" 패턴 제거
                    cleanTitle = cleanTitle.replace(/^(\s*\d{1,2}\:\d{2}\s*)/, '');
                    
                    // 결과 적용
                    titleEl.textContent = cleanTitle;
                  }
                }
              }}
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
            events={schedules && Array.isArray(schedules) ? 
              // 일정 중복 방지를 위해 id값으로 중복 제거
              [...new Map(schedules.map(item => [item.id, item])).values()].map(schedule => {
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
                  classNames: schedule.type === 'PROJECT' ? ['project-event'] : ['inactive-event'],
                  extendedProps: {
                    content: schedule.content || ''
                  }
                };
              }) : []}
            selectable={true}
            selectMirror={true}
            dayMaxEventRows={3}
            moreLinkContent={(args) => {
              return `+${args.num}`;
            }}
            eventContent={(arg) => {
              // 이벤트 내용 커스터마이징
              const container = document.createElement('div');
              container.className = 'fc-event-container';
              
              // 1. 제목 추가
              const title = document.createElement('div');
              title.className = 'fc-event-title';
              title.style.fontWeight = 'bold';
              title.innerHTML = arg.event.title;
              container.appendChild(title); // 제목 추가
              
              // 2. 시간 표시
              const time = document.createElement('div');
              time.className = 'fc-event-time';
              
              // 시간 포맷팅 (달력 뷰에 따라 다르게 표시)
              if (arg.view.type === 'dayGridMonth') {
                // 월별 뷰에서는 시간 표시 안 함
                time.style.display = 'none';
              } else {
                // 주/일 뷰에서 시간 형식 표시
                const startDate = arg.event.start;
                const endDate = arg.event.end || new Date(startDate.getTime() + 3600000);
                
                const startHours = startDate.getHours().toString().padStart(2, '0');
                const startMinutes = startDate.getMinutes().toString().padStart(2, '0');
                const endHours = endDate.getHours().toString().padStart(2, '0');
                const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
                
                time.innerHTML = `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
                time.style.fontSize = '0.85em';
              }
              container.appendChild(time); // 시간 추가
              
              // 3. 활동 내용 추가 (기본값 없음, 내용이 있는 경우에만 표시)
              if (arg.event.extendedProps && arg.event.extendedProps.content) {
                const content = arg.event.extendedProps.content.trim();
                
                // 내용이 비어있지 않고 '활동 내용이 없습니다' 같은 문구가 아닌 경우에만 표시
                if (content !== '' && content !== '활동 내용이 없습니다.' && arg.view.type !== 'dayGridMonth') {
                  const description = document.createElement('div');
                  description.className = 'fc-event-description';
                  description.style.fontSize = '0.85em';
                  description.style.marginTop = '2px';
                  description.style.whiteSpace = 'nowrap';
                  description.style.overflow = 'hidden';
                  description.style.textOverflow = 'ellipsis';
                  description.innerHTML = content;
                  container.appendChild(description); // 활동 내용 추가
                }
              }
              
              return { domNodes: [container] };
            }}
            eventClick={handleEventClick}
            select={handleDateSelect}
            dateClick={(info) => handleDateSelect({
              start: info.date,
              end: new Date(info.date.getTime() + 3600000) // 1시간 후
            })}
            datesSet={handleMonthChange}
            locale="ko"
            allDaySlot={false}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            height="auto"
            selectOverlap={false} // 일정끼리 격치지 않도록 제한
            dayCellContent={(args) => {
              // 월별 뷰에서만 적용
              if (args.view.type === 'dayGridMonth') {
                return { html: `<span class="fc-daygrid-day-number">${args.dayNumberText.replace('일', '')}</span>` };
              }
              return { html: args.dayNumberText };
            }}
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
        onDelete={handleProjectDelete}
        onClose={closeProjectModal}
        selectedYear={parseInt(year)}
        selectedMonth={parseInt(month)}
        refreshTrigger={scheduleRefreshTrigger}
      />
    </div>
  );
}

export default Calendar;
