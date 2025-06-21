package com.jbnu.calelog.service;

import com.jbnu.calelog.dto.*;
import com.jbnu.calelog.dto.ScheduleCreateRequestDto.RepeatOptions;
import com.jbnu.calelog.entity.Project;
import com.jbnu.calelog.entity.Schedule;
import com.jbnu.calelog.entity.User;
import com.jbnu.calelog.exception.ScheduleConflictException;
import com.jbnu.calelog.repository.ProjectRepository;
import com.jbnu.calelog.repository.ScheduleRepository;
import com.jbnu.calelog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ScheduleResponseDto> getMonthlySchedules(int year, int month, Long userId) {
        List<Schedule> schedules = scheduleRepository.findByUserIdAndYearAndMonth(userId, year, month);
        return schedules.stream()
                .map(this::convertToResponseDto)
                .toList();
    }

    public ScheduleCreateResponseDto createSchedule(ScheduleCreateRequestDto request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        if (request.getRepeat() == null || !request.getRepeat().isEnabled()) {
            Schedule schedule = createSingleScheduleFromRequest(request, user, null);
            validateScheduleConflict(schedule);
            Schedule savedSchedule = scheduleRepository.save(schedule);
            ScheduleResponseDto responseDto = convertToResponseDto(savedSchedule);
            return ScheduleCreateResponseDto.single(responseDto);
        }

        String groupId = UUID.randomUUID().toString();
        List<Schedule> schedulesToCreate = generateSchedulesFromRepeatRule(request, user, groupId);
        
        validateScheduleConflicts(schedulesToCreate);
        
        List<Schedule> savedSchedules = scheduleRepository.saveAll(schedulesToCreate);
        List<ScheduleResponseDto> allScheduleResponses = savedSchedules.stream()
                .map(this::convertToResponseDto)
                .toList();
        
        return ScheduleCreateResponseDto.recurring(allScheduleResponses.get(0), allScheduleResponses);
    }

    public ScheduleResponseDto updateSchedule(Long scheduleId, ScheduleUpdateRequestDto request, Long userId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다"));

        updateScheduleFromRequest(schedule, request);
        validateScheduleConflict(schedule);
        
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return convertToResponseDto(savedSchedule);
    }

    public void deleteSchedule(Long scheduleId, ScheduleDeleteRequestDto request, Long userId) {
        Schedule schedule = scheduleRepository.findByIdAndUserId(scheduleId, userId)
                .orElseThrow(() -> new RuntimeException("일정을 찾을 수 없습니다"));

        if (request.isDeleteAllRecurrences() && schedule.getRecurringGroupId() != null) {
            scheduleRepository.deleteByRecurringGroupIdAndUserId(schedule.getRecurringGroupId(), userId);
        } else {
            scheduleRepository.delete(schedule);
        }
    }

    private Schedule createSingleScheduleFromRequest(ScheduleCreateRequestDto request, User user, String groupId) {
        LocalDateTime start = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime end = LocalDateTime.of(request.getDate(), request.getEndTime());

        Project project = null;
        if ("PROJECT".equals(request.getType()) && request.getProjectId() != null) {
            project = projectRepository.findByIdAndUserId(request.getProjectId(), user.getId())
                    .orElse(null);
        }

        return Schedule.builder()
                .user(user)
                .project(project)
                .recurringGroupId(groupId)
                .type(Schedule.ScheduleType.valueOf(request.getType()))
                .title(request.getTitle())
                .content(request.getContent())
                .startTime(start)
                .endTime(end)
                .build();
    }

    private void updateScheduleFromRequest(Schedule schedule, ScheduleUpdateRequestDto request) {
        LocalDateTime start = LocalDateTime.of(request.getDate(), request.getStartTime());
        LocalDateTime end = LocalDateTime.of(request.getDate(), request.getEndTime());

        Project project = null;
        if ("PROJECT".equals(request.getType()) && request.getProjectId() != null) {
            project = projectRepository.findByIdAndUserId(request.getProjectId(), schedule.getUser().getId())
                    .orElse(null);
        }

        schedule.setTitle(request.getTitle());
        schedule.setType(Schedule.ScheduleType.valueOf(request.getType()));
        schedule.setProject(project);
        schedule.setContent(request.getContent());
        schedule.setStartTime(start);
        schedule.setEndTime(end);
    }

    private List<Schedule> generateSchedulesFromRepeatRule(ScheduleCreateRequestDto request, User user, String groupId) {
        List<Schedule> schedules = new ArrayList<>();
        RepeatOptions repeat = request.getRepeat();
        
        LocalDate currentDate = request.getDate();
        LocalDate endDate = "date".equals(repeat.getEndType()) ? repeat.getEndDate() : currentDate.plusMonths(6);
        
        int count = 0;
        int maxCount = "count".equals(repeat.getEndType()) ? repeat.getEndCount() : 200;
        
        while (!currentDate.isAfter(endDate) && count < maxCount) {
            if (shouldCreateScheduleOnDate(currentDate, request.getDate(), repeat)) {
                Schedule schedule = createSingleScheduleFromRequest(
                    ScheduleCreateRequestDto.builder()
                        .title(request.getTitle())
                        .type(request.getType())
                        .projectId(request.getProjectId())
                        .content(request.getContent())
                        .date(currentDate)
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .build(),
                    user, 
                    groupId
                );
                schedules.add(schedule);
                count++;
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return schedules;
    }

    private boolean shouldCreateScheduleOnDate(LocalDate date, LocalDate startDate, RepeatOptions repeat) {
        if (date.isBefore(startDate)) {
            return false;
        }
        
        if ("weekly".equals(repeat.getFrequency())) {
            int dayOfWeek = date.getDayOfWeek().getValue();
            String dayStr = String.valueOf(dayOfWeek);
            
            if (repeat.getDays() != null) {
                for (String day : repeat.getDays()) {
                    if (dayStr.equals(day)) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        if ("daily".equals(repeat.getFrequency())) {
            long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, date);
            return daysBetween % repeat.getInterval() == 0;
        }
        
        return false;
    }

    private void validateScheduleConflict(Schedule newSchedule) {
        List<Schedule> conflictingSchedules = scheduleRepository.findConflictingSchedules(
                newSchedule.getUser().getId(),
                newSchedule.getStartTime(),
                newSchedule.getEndTime(),
                newSchedule.getId()
        );
        
        if (!conflictingSchedules.isEmpty()) {
            throw new ScheduleConflictException("해당 시간에 이미 다른 일정이 존재합니다.", conflictingSchedules);
        }
    }

    private void validateScheduleConflicts(List<Schedule> schedules) {
        for (Schedule schedule : schedules) {
            validateScheduleConflict(schedule);
        }
    }

    private ScheduleResponseDto convertToResponseDto(Schedule schedule) {
        return ScheduleResponseDto.builder()
                .id(schedule.getId())
                .title(schedule.getTitle())
                .start(schedule.getStartTime())
                .end(schedule.getEndTime())
                .date(schedule.getStartTime().toLocalDate())
                .startTime(schedule.getStartTime().toLocalTime())
                .endTime(schedule.getEndTime().toLocalTime())
                .type(schedule.getType().toString())
                .projectId(schedule.getProject() != null ? schedule.getProject().getId() : null)
                .content(schedule.getContent())
                .recurrenceId(schedule.getRecurringGroupId())
                .build();
    }
}