package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 토큰 재발급 응답 DTO
 *             새로 발급된 액세스 토큰을 담는 응답 객체
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshResponseDto {
    
    private String accessToken;
}