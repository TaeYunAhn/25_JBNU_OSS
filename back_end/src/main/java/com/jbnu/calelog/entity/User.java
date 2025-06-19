package com.jbnu.calelog.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 사용자 계정 정보를 저장하는 엔티티 클래스
 *             이메일 기반 로그인 및 JWT 인증을 지원
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Builder.Default
    private Long id = null;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", nullable = false, length = 50)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 20)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = null;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    public enum AuthProvider {
        LOCAL
    }

}