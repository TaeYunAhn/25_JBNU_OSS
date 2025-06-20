package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 최근 활동 DTO - GET /projects/{id}/activities 응답용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectActivityDto {

    private Long id;

    private String content;

    private String date;

    private String startTime;

    private String endTime;
}