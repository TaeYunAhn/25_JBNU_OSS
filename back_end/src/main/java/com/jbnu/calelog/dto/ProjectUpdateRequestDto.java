package com.jbnu.calelog.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 수정 요청 DTO - 프론트엔드와 호환되는 필드 구조
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectUpdateRequestDto {

    @NotBlank(message = "프로젝트 이름은 필수입니다")
    @Size(max = 100, message = "프로젝트 이름은 100자 이하여야 합니다")
    private String name;

    @NotBlank(message = "프로젝트 색상은 필수입니다")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "색상은 #RRGGBB 형식이어야 합니다")
    private String color;

    @NotNull(message = "시작 날짜는 필수입니다")
    private LocalDate startDate;

    @NotNull(message = "종료 날짜는 필수입니다")
    private LocalDate endDate;

    @NotNull(message = "월별 필수 시간은 필수입니다")
    @Min(value = 1, message = "월별 필수 시간은 1시간 이상이어야 합니다")
    @Max(value = 100, message = "월별 필수 시간은 100시간 이하여야 합니다")
    private Integer monthlyRequiredHours;
}