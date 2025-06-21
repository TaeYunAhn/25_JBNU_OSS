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
     * CORS 설정 - CI/CD 및 확장성을 고려한 환경변수 기반 설정
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 환경변수에서 허용 도메인 읽기 (기본값: 로컬 개발 환경)
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOriginPatterns(origins);
        
        // 동적 패턴 추가 (EC2, AWS, 기타 클라우드 배포 고려)
        configuration.addAllowedOriginPattern("http://*.amazonaws.com:*");   // AWS EC2
        configuration.addAllowedOriginPattern("https://*.amazonaws.com:*");  // AWS EC2 HTTPS
        configuration.addAllowedOriginPattern("http://*:3000");              // 모든 IP의 3000 포트
        configuration.addAllowedOriginPattern("https://*.vercel.app");       // Vercel 배포
        configuration.addAllowedOriginPattern("https://*.netlify.app");      // Netlify 배포
        configuration.addAllowedOriginPattern("https://*.github.io");        // GitHub Pages
        
        // 환경변수에서 허용 메서드 읽기
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        configuration.setAllowedMethods(methods);
        
        // 환경변수에서 허용 헤더 읽기 + 기본 필수 헤더 추가
        List<String> headers = Arrays.asList(allowedHeaders.split(","));
        configuration.setAllowedHeaders(headers);
        configuration.addAllowedHeader("Access-Control-Request-Method");
        configuration.addAllowedHeader("Access-Control-Request-Headers");
        
        // 인증 정보 포함 허용 (JWT 토큰)
        configuration.setAllowCredentials(true);
        
        // 브라우저가 CORS 응답을 캐시하는 시간 (초)
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}