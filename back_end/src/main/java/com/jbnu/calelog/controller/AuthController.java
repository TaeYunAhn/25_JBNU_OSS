package com.jbnu.calelog.controller;

import com.jbnu.calelog.dto.*;
import com.jbnu.calelog.entity.User;
import com.jbnu.calelog.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 사용자 인증 관련 API를 제공하는 컨트롤러
 *             회원가입, 로그인, 토큰 갱신 기능을 담당
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "사용자 인증 관리")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @Operation(summary = "회원가입", description = "새로운 사용자 계정을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "회원가입 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (유효하지 않은 입력)"),
        @ApiResponse(responseCode = "409", description = "이미 존재하는 이메일")
    })
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequestDto signupRequest) {
        try {
            User user = userService.signup(
                signupRequest.getEmail(),
                signupRequest.getPassword(),
                signupRequest.getFullName()
            );

            SignupResponseDto response = SignupResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            String errorCode = e.getMessage();
            ErrorResponseDto errorResponse;
            
            if ("EMAIL_ALREADY_EXISTS".equals(errorCode)) {
                errorResponse = ErrorResponseDto.builder()
                    .errorCode("EMAIL_ALREADY_EXISTS")
                    .message("이미 가입된 이메일입니다.")
                    .build();
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            } else if ("INVALID_INPUT".equals(errorCode)) {
                errorResponse = ErrorResponseDto.builder()
                    .errorCode("INVALID_INPUT")
                    .message("비밀번호는 8자 이상이어야 합니다.")
                    .build();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            } else {
                errorResponse = ErrorResponseDto.builder()
                    .errorCode("INVALID_INPUT")
                    .message("잘못된 요청입니다.")
                    .build();
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
        }
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "로그인 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패 (이메일 또는 비밀번호 불일치)")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        try {
            Object[] loginResult = userService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            );

            String accessToken = (String) loginResult[0];
            String refreshToken = (String) loginResult[1];
            User user = (User) loginResult[2];

            UserResponseDto userDto = UserResponseDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();

            LoginResponseDto response = LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .build();

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            ErrorResponseDto errorResponse = ErrorResponseDto.builder()
                .errorCode("INVALID_CREDENTIALS")
                .message("이메일 또는 비밀번호가 일치하지 않습니다.")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
        @ApiResponse(responseCode = "401", description = "유효하지 않은 리프레시 토큰")
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@Valid @RequestBody RefreshRequestDto refreshRequest) {
        try {
            String newAccessToken = userService.refreshAccessToken(refreshRequest.getRefreshToken());

            RefreshResponseDto response = RefreshResponseDto.builder()
                .accessToken(newAccessToken)
                .build();

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            ErrorResponseDto errorResponse = ErrorResponseDto.builder()
                .errorCode("INVALID_REFRESH_TOKEN")
                .message("유효하지 않은 리프레시 토큰입니다.")
                .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}