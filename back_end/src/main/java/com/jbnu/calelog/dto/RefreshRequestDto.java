package com.jbnu.calelog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 토큰 재발급 요청 DTO
 *             리프레시 토큰 정보를 담는 요청 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshRequestDto {
    
    @NotBlank(message = "리프레시 토큰은 필수입니다.")
    private String refreshToken;
}