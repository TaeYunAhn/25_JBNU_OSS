package com.jbnu.calelog.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 회원가입 요청 DTO
 *             이메일, 비밀번호, 이름 정보를 담는 요청 객체
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequestDto {
    
    @Email(message = "유효한 이메일 형식이어야 합니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;
    
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다.")
    private String password;
    
    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50, message = "이름은 50자 이하여야 합니다.")
    private String fullName;
}