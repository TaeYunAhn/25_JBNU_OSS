package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;
import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 중복 에러 응답 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleConflictErrorDto {
    
    private String errorCode;
    private String message;
    private List<ConflictSchedule> conflictSchedules;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConflictSchedule {
        private Long id;
        private String title;
        private LocalTime startTime;
        private LocalTime endTime;
    }
}