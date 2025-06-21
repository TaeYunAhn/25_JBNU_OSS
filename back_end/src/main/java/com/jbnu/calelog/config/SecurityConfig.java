package com.jbnu.calelog.config;

import com.jbnu.calelog.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description Spring Security JWT 인증 설정
 *             JWT 기반 인증 시스템 + Swagger UI 접근 허용
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
    private String allowedOrigins;
    
    @Value("${app.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,HEAD}")
    private String allowedMethods;
    
    @Value("${app.cors.allowed-headers:Origin,Content-Type,Accept,Authorization}")
    private String allowedHeaders;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // 인증 API는 누구나 접근 가능
                .requestMatchers("/api/auth/**").permitAll()
                // Swagger UI 접근 허용
                .requestMatchers(
                    "/swagger-ui/**", 
                    "/swagger-ui.html", 
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**"
                ).permitAll()
                // H2 콘솔 접근 허용 (개발환경)
                .requestMatchers("/h2-console/**").permitAll()
                // 그 외 모든 API는 인증 필요
                .anyRequest().authenticated()
            )
            // H2 콘솔 사용을 위한 헤더 설정
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable())
            )
            // JWT 인증 필터 추가
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    /**
     * 비밀번호 암호화를 위한 BCrypt 인코더
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS 설정 - 환경별 통합 관리
     * 로컬: 개발 포트 (3000, 3001, 8080)
     * 배포: 환경변수 기반 동적 설정
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 1. 환경변수 기반 허용 도메인 (운영/개발 통합)
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        
        // 2. 개발 환경 기본 도메인 (로컬 개발 + Swagger UI)
        configuration.addAllowedOrigin("http://localhost:8080");   // Swagger UI
        configuration.addAllowedOrigin("http://127.0.0.1:8080");   // Swagger UI (127.0.0.1)
        configuration.addAllowedOrigin("http://localhost:3000");   // 프론트엔드 개발
        configuration.addAllowedOrigin("http://127.0.0.1:3000");   // 프론트엔드 개발
        
        // 3. 허용 메서드 (환경변수 기반)
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // 4. 허용 헤더 (JWT 인증 고려)
        List<String> headers = Arrays.asList(allowedHeaders.split(","));
        configuration.setAllowedHeaders(headers);
        configuration.addAllowedHeader("X-Requested-With");
        configuration.addAllowedHeader("Access-Control-Request-Method");
        configuration.addAllowedHeader("Access-Control-Request-Headers");
        
        // 5. JWT 토큰 전송을 위한 Credentials 허용
        configuration.setAllowCredentials(true);
        
        // 6. CORS preflight 캐시 시간
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}