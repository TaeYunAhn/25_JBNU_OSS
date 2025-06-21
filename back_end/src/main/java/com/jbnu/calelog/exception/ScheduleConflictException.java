package com.jbnu.calelog.exception;

import com.jbnu.calelog.entity.Schedule;
import lombok.Getter;

import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 시간 중복 예외
 */
@Getter
public class ScheduleConflictException extends RuntimeException {
    
    private final List<Schedule> conflictingSchedules;
    
    public ScheduleConflictException(String message, List<Schedule> conflictingSchedules) {
        super(message);
        this.conflictingSchedules = conflictingSchedules;
    }
}