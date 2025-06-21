package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 삭제 요청 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDeleteRequestDto {
    
    @Builder.Default
    private boolean deleteAllRecurrences = false;
}