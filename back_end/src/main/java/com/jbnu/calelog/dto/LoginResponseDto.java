package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 로그인 응답 DTO
 *             액세스 토큰, 리프레시 토큰, 사용자 정보를 담는 응답 객체
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {
    
    private String accessToken;
    private String refreshToken;
    private UserResponseDto user;
}