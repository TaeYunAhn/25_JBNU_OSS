package com.jbnu.calelog.service;

import com.jbnu.calelog.dto.*;
import com.jbnu.calelog.entity.Project;
import com.jbnu.calelog.entity.Schedule;
import com.jbnu.calelog.entity.User;
import com.jbnu.calelog.repository.ProjectRepository;
import com.jbnu.calelog.repository.ScheduleRepository;
import com.jbnu.calelog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 관리 서비스 - CRUD 및 통계 계산 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;

    /**
     * 사용자의 모든 프로젝트를 통계와 함께 조회
     */
    public List<ProjectResponseDto> getAllProjectsWithStatistics(Long userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        return projects.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * 새 프로젝트 생성
     */
    @Transactional
    public ProjectResponseDto createProject(ProjectCreateRequestDto request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Project project = Project.builder()
                .user(user)
                .name(request.getName())
                .color(request.getColor())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyRequiredHours(request.getMonthlyRequiredHours())
                .build();

        Project savedProject = projectRepository.save(project);
        return convertToResponseDto(savedProject);
    }

    /**
     * 프로젝트 수정
     */
    @Transactional
    public ProjectResponseDto updateProject(Long projectId, ProjectUpdateRequestDto request, Long userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없거나 수정 권한이 없습니다"));

        project.setName(request.getName());
        project.setColor(request.getColor());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setMonthlyRequiredHours(request.getMonthlyRequiredHours());

        Project updatedProject = projectRepository.save(project);
        return convertToResponseDto(updatedProject);
    }

    /**
     * 프로젝트 삭제 (관련 일정의 project_id를 NULL로 설정)
     */
    @Transactional
    public void deleteProject(Long projectId, Long userId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없거나 삭제 권한이 없습니다"));

        // 관련 일정들의 project_id를 NULL로 설정
        List<Schedule> relatedSchedules = scheduleRepository.findByProjectId(projectId);
        relatedSchedules.forEach(schedule -> schedule.setProject(null));
        scheduleRepository.saveAll(relatedSchedules);

        // 프로젝트 삭제
        projectRepository.delete(project);
    }

    /**
     * 프로젝트의 최근 활동 내역 조회 (최대 5개)
     */
    public List<ProjectActivityDto> getRecentActivities(Long projectId, int limit, Long userId) {
        // 프로젝트 소유권 검증
        projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없거나 조회 권한이 없습니다"));

        // 최근 활동 조회
        List<Schedule> recentSchedules = scheduleRepository.findRecentByProjectId(projectId, limit);
        
        return recentSchedules.stream()
                .map(this::convertToActivityDto)
                .collect(Collectors.toList());
    }

    /**
     * Project 엔티티를 ProjectResponseDto로 변환
     */
    private ProjectResponseDto convertToResponseDto(Project project) {
        ProjectStatisticsDto statistics = calculateStatistics(project);
        
        return ProjectResponseDto.builder()
                .id(project.getId())
                .name(project.getName())
                .color(project.getColor())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .monthlyRequiredHours(project.getMonthlyRequiredHours())
                .statistics(statistics)
                .build();
    }

    /**
     * 프로젝트 통계 계산
     */
    private ProjectStatisticsDto calculateStatistics(Project project) {
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        // 현재 월의 총 활동 시간 계산
        List<Schedule> currentMonthSchedules = scheduleRepository
                .findByProjectIdAndYearAndMonth(project.getId(), currentYear, currentMonth);

        double currentMonthHours = currentMonthSchedules.stream()
                .mapToDouble(this::calculateDurationInHours)
                .sum();

        // 진행률 계산
        double progressRate = (currentMonthHours / project.getMonthlyRequiredHours()) * 100.0;
        progressRate = Math.min(Math.max(progressRate, 0.0), 100.0); // 0~100 범위로 제한

        // 프로젝트 활성 상태 판단
        boolean isActive = now.isAfter(project.getStartDate().minusDays(1)) && 
                          now.isBefore(project.getEndDate().plusDays(1));

        return ProjectStatisticsDto.builder()
                .currentMonthHours(Math.round(currentMonthHours * 10.0) / 10.0) // 소수점 1자리
                .progressRate(Math.round(progressRate * 100.0) / 100.0) // 소수점 2자리
                .isActive(isActive)
                .build();
    }

    /**
     * Schedule 엔티티를 ProjectActivityDto로 변환
     */
    private ProjectActivityDto convertToActivityDto(Schedule schedule) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        return ProjectActivityDto.builder()
                .id(schedule.getId())
                .content(schedule.getContent())
                .date(schedule.getStartTime().format(dateFormatter))
                .startTime(schedule.getStartTime().format(timeFormatter))
                .endTime(schedule.getEndTime().format(timeFormatter))
                .build();
    }

    /**
     * 시간 차이를 시간 단위로 계산
     */
    private double calculateDurationInHours(Schedule schedule) {
        LocalDateTime start = schedule.getStartTime();
        LocalDateTime end = schedule.getEndTime();
        
        long minutes = java.time.Duration.between(start, end).toMinutes();
        return minutes / 60.0;
    }
    
    /**
     * 특정 프로젝트의 월별 통계 정보 조회
     * 
     * @param projectId 프로젝트 ID
     * @param year 년도
     * @param month 월
     * @param userId 사용자 ID (권한 검증용)
     * @return 프로젝트의 월별 통계 정보
     */
    public ProjectMonthlyStatsDto getMonthlyStats(Long projectId, int year, int month, Long userId) {
        // 프로젝트 소유권 검증
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("프로젝트를 찾을 수 없거나 조회 권한이 없습니다"));
        
        // 해당 월의 프로젝트 일정 조회
        List<Schedule> monthlySchedules = scheduleRepository
                .findByProjectIdAndYearAndMonth(projectId, year, month);
        
        // 완료된 시간 계산
        double completedHours = monthlySchedules.stream()
                .mapToDouble(this::calculateDurationInHours)
                .sum();
        
        // 소수점 1자리로 반올림
        completedHours = Math.round(completedHours * 10.0) / 10.0;
        
        // 필요한 시간 (프로젝트에 설정된 월 요구 시간)
        double requiredHours = project.getMonthlyRequiredHours();
        
        // 진행률 계산 (완료 시간 / 요구 시간) x 100%
        double progressPercentage = (requiredHours > 0) ? (completedHours / requiredHours) * 100.0 : 0.0;
        
        // 0-100 범위로 제한 및 소수점 2자리로 반올림
        progressPercentage = Math.min(Math.max(progressPercentage, 0.0), 100.0);
        progressPercentage = Math.round(progressPercentage * 100.0) / 100.0;
        
        // DTO 구성 및 반환
        return ProjectMonthlyStatsDto.builder()
                .projectId(projectId)
                .year(year)
                .month(month)
                .completedHours(completedHours)
                .requiredHours(requiredHours)
                .progressPercentage(progressPercentage)
                .build();
    }
}