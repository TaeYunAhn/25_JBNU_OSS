package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 응답 DTO - 프론트엔드 요구 형식에 맞춘 프로젝트 정보
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDto {

    private Long id;

    private String name;

    private String color;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer monthlyRequiredHours;

    private ProjectStatisticsDto statistics;
}