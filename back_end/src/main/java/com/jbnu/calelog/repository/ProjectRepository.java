package com.jbnu.calelog.repository;

import com.jbnu.calelog.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-19
 * @description 프로젝트 정보에 대한 데이터 접근 계층
 *             사용자별 프로젝트 관리를 위한 Repository
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * 특정 사용자의 모든 프로젝트 조회 (최신순)
     * @param userId 사용자 ID
     * @return 해당 사용자의 프로젝트 목록
     */
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Project> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    /**
     * 특정 사용자의 특정 프로젝트 조회 (소유권 검증용)
     * @param projectId 프로젝트 ID
     * @param userId 사용자 ID
     * @return 해당 조건에 맞는 프로젝트
     */
    @Query("SELECT p FROM Project p WHERE p.id = :projectId AND p.user.id = :userId")
    Optional<Project> findByIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
}