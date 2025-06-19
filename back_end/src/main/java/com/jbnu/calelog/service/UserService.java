package com.jbnu.calelog.service;

import com.jbnu.calelog.entity.User;
import com.jbnu.calelog.repository.UserRepository;
import com.jbnu.calelog.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 사용자 인증 및 계정 관리 서비스
 *             API 명세에 맞는 회원가입, 로그인, 토큰 갱신 기능
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 회원가입 처리
     * @param email 이메일
     * @param password 비밀번호 (평문)
     * @param fullName 전체 이름
     * @return 생성된 사용자 정보
     * @throws IllegalArgumentException 이메일 중복 또는 유효성 검사 실패 시
     */
    public User signup(String email, String password, String fullName) {
        // 이메일 중복 검사
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("EMAIL_ALREADY_EXISTS");
        }

        // 비밀번호 유효성 검사 (8자 이상)
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("INVALID_INPUT");
        }

        // 사용자 생성 (Builder 패턴)
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password)) // BCrypt 암호화
                .fullName(fullName)
                .build();

        return userRepository.save(user);
    }

    /**
     * 로그인 처리 및 토큰 생성
     * @param email 이메일
     * @param password 비밀번호 (평문)
     * @return 토큰 정보 및 사용자 정보를 담은 배열 [accessToken, refreshToken, user]
     * @throws IllegalArgumentException 인증 실패 시
     */
    public Object[] login(String email, String password) {
        // 사용자 조회
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        }

        User user = userOptional.get();

        // 비밀번호 검증
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("INVALID_CREDENTIALS");
        }

        // 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        return new Object[]{accessToken, refreshToken, user};
    }

    /**
     * Refresh Token으로 새로운 Access Token 발급
     * @param refreshToken Refresh Token
     * @return 새로운 Access Token
     * @throws IllegalArgumentException 유효하지 않은 토큰 시
     */
    public String refreshAccessToken(String refreshToken) {
        // 토큰 유효성 검증
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("INVALID_REFRESH_TOKEN");
        }

        // 토큰 타입 확인
        String tokenType = jwtUtil.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new IllegalArgumentException("INVALID_REFRESH_TOKEN");
        }

        // 사용자 ID 추출
        Long userId = jwtUtil.getUserIdFromToken(refreshToken);

        // 사용자 존재 확인
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("INVALID_REFRESH_TOKEN");
        }

        User user = userOptional.get();

        // 새로운 Access Token 생성
        return jwtUtil.generateAccessToken(user.getId(), user.getEmail());
    }

    /**
     * 사용자 ID로 사용자 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

}