package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프로젝트의 월별 통계 정보를 담는 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMonthlyStatsDto {
    private Long projectId;
    private Integer year;
    private Integer month;
    private Double completedHours;
    private Double requiredHours;
    private Double progressPercentage;
}
