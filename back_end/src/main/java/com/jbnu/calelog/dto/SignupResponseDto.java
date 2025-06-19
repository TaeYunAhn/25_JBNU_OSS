package com.jbnu.calelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 회원가입 응답 DTO
 *             생성된 사용자의 기본 정보를 담는 응답 객체
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupResponseDto {
    
    private Long id;
    private String email;
    private String fullName;
}