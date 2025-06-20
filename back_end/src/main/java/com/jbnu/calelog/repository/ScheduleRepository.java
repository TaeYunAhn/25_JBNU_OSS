package com.jbnu.calelog.repository;

import com.jbnu.calelog.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-20
 * @description 일정 정보에 대한 데이터 접근 계층
 *              월별 일정 조회, 시간 중복 검증, 프로젝트별 활동 내역 관리
 */
@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    /**
     * 특정 사용자의 월별 일정 조회
     * @param userId 사용자 ID
     * @param year 년도
     * @param month 월
     * @return 해당 월의 모든 일정
     */
    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId " +
           "AND YEAR(s.startTime) = :year AND MONTH(s.startTime) = :month " +
           "ORDER BY s.startTime ASC")
    List<Schedule> findByUserIdAndYearAndMonth(@Param("userId") Long userId, 
                                               @Param("year") int year, 
                                               @Param("month") int month);

    /**
     * 시간 중복 검증용 일정 조회
     * @param userId 사용자 ID
     * @param startTime 시작 시간
     * @param endTime 종료 시간
     * @param excludeId 제외할 일정 ID (수정 시 자기 자신 제외)
     * @return 중복되는 일정 목록
     */
    @Query("SELECT s FROM Schedule s WHERE s.user.id = :userId " +
           "AND s.startTime < :endTime AND s.endTime > :startTime " +
           "AND (:excludeId IS NULL OR s.id != :excludeId)")
    List<Schedule> findConflictingSchedules(@Param("userId") Long userId,
                                           @Param("startTime") LocalDateTime startTime,
                                           @Param("endTime") LocalDateTime endTime,
                                           @Param("excludeId") Long excludeId);

    /**
     * 특정 프로젝트의 최근 활동 내역 조회 (활동일지용)
     * @param projectId 프로젝트 ID
     * @param limit 조회할 개수
     * @return 최근 활동 내역
     */
    @Query(value = "SELECT * FROM schedules s WHERE s.project_id = :projectId " +
           "AND s.schedule_type = 'PROJECT' " +
           "ORDER BY s.start_time DESC LIMIT :limit", nativeQuery = true)
    List<Schedule> findRecentByProjectId(@Param("projectId") Long projectId, @Param("limit") int limit);

    /**
     * 특정 프로젝트의 모든 일정 조회 (프로젝트 삭제 시 사용)
     * @param projectId 프로젝트 ID
     * @return 해당 프로젝트의 모든 일정
     */
    List<Schedule> findByProjectId(Long projectId);

    /**
     * 특정 프로젝트의 월별 활동 시간 계산용 일정 조회
     * @param projectId 프로젝트 ID
     * @param year 년도
     * @param month 월
     * @return 해당 월의 프로젝트 활동 일정
     */
    @Query("SELECT s FROM Schedule s WHERE s.project.id = :projectId " +
           "AND s.type = 'PROJECT' " +
           "AND YEAR(s.startTime) = :year AND MONTH(s.startTime) = :month")
    List<Schedule> findByProjectIdAndYearAndMonth(@Param("projectId") Long projectId,
                                                  @Param("year") int year,
                                                  @Param("month") int month);

    /**
     * 특정 사용자의 특정 일정 조회 (소유권 검증용)
     * @param scheduleId 일정 ID
     * @param userId 사용자 ID
     * @return 해당 조건에 맞는 일정
     */
    @Query("SELECT s FROM Schedule s WHERE s.id = :scheduleId AND s.user.id = :userId")
    Optional<Schedule> findByIdAndUserId(@Param("scheduleId") Long scheduleId, @Param("userId") Long userId);

    /**
     * 반복 일정 그룹의 모든 일정 조회
     * @param recurringGroupId 반복 그룹 ID
     * @return 해당 그룹의 모든 일정
     */
    List<Schedule> findByRecurringGroupId(String recurringGroupId);
}