package com.jbnu.calelog.repository;

import com.jbnu.calelog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 사용자 정보에 대한 데이터 접근 계층
 *             이메일 기반 인증 및 사용자 관리를 위한 Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회 (로그인용)
     * @param email 사용자 이메일
     * @return 사용자 정보 (Optional)
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 중복 확인 (회원가입용)
     * @param email 확인할 이메일
     * @return 존재 여부
     */
    boolean existsByEmail(String email);

}