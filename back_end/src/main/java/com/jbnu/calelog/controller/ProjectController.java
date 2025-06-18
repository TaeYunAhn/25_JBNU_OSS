package com.jbnu.calelog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-18
 * @description 프로젝트 관리 API를 제공하는 컨트롤러
 *             활동 프로젝트의 생성, 조회, 수정, 삭제 기능을 담당
 */
@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "프로젝트 관리")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    @Operation(summary = "내 프로젝트 목록 조회", description = "현재 로그인한 사용자의 모든 프로젝트를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<?> getMyProjects() {
        // 내 프로젝트 목록 조회 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "새 프로젝트 생성", description = "새로운 활동 프로젝트를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody Object createProjectRequest) {
        // 프로젝트 생성 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트 수정", description = "기존 프로젝트의 정보를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(
            @Parameter(description = "수정할 프로젝트 ID") @PathVariable Long projectId,
            @RequestBody Object updateProjectRequest) {
        // 프로젝트 수정 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "프로젝트 삭제", description = "프로젝트를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @Parameter(description = "삭제할 프로젝트 ID") @PathVariable Long projectId) {
        // 프로젝트 삭제 로직 구현 예정
        return ResponseEntity.ok().build();
    }
}