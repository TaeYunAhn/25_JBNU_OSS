package com.jbnu.calelog.config;

import com.jbnu.calelog.dto.ScheduleConflictErrorDto;
import com.jbnu.calelog.exception.ScheduleConflictException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 전역 예외 처리기
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ScheduleConflictException.class)
    public ResponseEntity<ScheduleConflictErrorDto> handleScheduleConflict(ScheduleConflictException e) {
        List<ScheduleConflictErrorDto.ConflictSchedule> conflictSchedules = 
                e.getConflictingSchedules().stream()
                        .map(schedule -> ScheduleConflictErrorDto.ConflictSchedule.builder()
                                .id(schedule.getId())
                                .title(schedule.getTitle())
                                .startTime(schedule.getStartTime().toLocalTime())
                                .endTime(schedule.getEndTime().toLocalTime())
                                .build())
                        .toList();

        ScheduleConflictErrorDto errorResponse = ScheduleConflictErrorDto.builder()
                .errorCode("SCHEDULE_CONFLICT")
                .message(e.getMessage())
                .conflictSchedules(conflictSchedules)
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }
}