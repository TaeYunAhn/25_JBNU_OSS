package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 통계 정보 DTO - 프론트엔드에서 요구하는 통계 데이터
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatisticsDto {

    private Double currentMonthHours;

    private Double progressRate;

    private Boolean isActive;
}