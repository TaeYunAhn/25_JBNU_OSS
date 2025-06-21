package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 생성 응답 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleCreateResponseDto {
    
    private ScheduleResponseDto mainSchedule;
    private List<ScheduleResponseDto> schedules;
    
    public static ScheduleCreateResponseDto single(ScheduleResponseDto schedule) {
        return ScheduleCreateResponseDto.builder()
                .mainSchedule(schedule)
                .schedules(List.of(schedule))
                .build();
    }
    
    public static ScheduleCreateResponseDto recurring(ScheduleResponseDto mainSchedule, List<ScheduleResponseDto> allSchedules) {
        return ScheduleCreateResponseDto.builder()
                .mainSchedule(mainSchedule)
                .schedules(allSchedules)
                .build();
    }
}