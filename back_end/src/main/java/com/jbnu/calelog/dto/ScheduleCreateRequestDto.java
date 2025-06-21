package com.jbnu.calelog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 일정 생성 요청 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleCreateRequestDto {

    @NotBlank(message = "일정 제목은 필수입니다")
    private String title;

    @NotNull(message = "일정 타입은 필수입니다")
    private String type;

    private Long projectId;

    private String content;

    @NotNull(message = "날짜는 필수입니다")
    private LocalDate date;

    @NotNull(message = "시작 시간은 필수입니다")
    private LocalTime startTime;

    @NotNull(message = "종료 시간은 필수입니다")
    private LocalTime endTime;

    private RepeatOptions repeat;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepeatOptions {
        @Builder.Default
        private boolean enabled = false;
        private String frequency;
        private Integer interval;
        private String[] days;
        private String endType;
        private LocalDate endDate;
        private Integer endCount;
    }
}