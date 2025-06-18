package com.jbnu.calelog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-18
 * @description 사용자 인증 관련 API를 제공하는 컨트롤러
 *             회원가입, 로그인, 토큰 갱신 기능을 담당
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "사용자 인증 관리")
public class AuthController {

    @Operation(summary = "회원가입", description = "새로운 사용자 계정을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "회원가입 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (유효하지 않은 입력)"),
        @ApiResponse(responseCode = "409", description = "이미 존재하는 이메일")
    })
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Object signupRequest) {
        // TODO: 회원가입 로직 구현
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "로그인 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패 (이메일 또는 비밀번호 불일치)")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Object loginRequest) {
        // TODO: 로그인 로직 구현
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "토큰 재발급", description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "토큰 재발급 성공"),
        @ApiResponse(responseCode = "401", description = "유효하지 않은 리프레시 토큰")
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Object refreshRequest) {
        // TODO: 토큰 재발급 로직 구현
        return ResponseEntity.ok().build();
    }
}