package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 조회 응답 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleResponseDto {
    
    private Long id;
    private String title;
    private LocalDateTime start;
    private LocalDateTime end;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String type;
    private Long projectId;
    private String content;
    private String recurrenceId;
}