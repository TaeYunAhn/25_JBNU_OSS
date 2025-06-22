package com.jbnu.calelog.controller;

import com.jbnu.calelog.dto.ProjectActivityDto;
import com.jbnu.calelog.dto.ProjectCreateRequestDto;
import com.jbnu.calelog.dto.ProjectMonthlyStatsDto;
import com.jbnu.calelog.dto.ProjectResponseDto;
import com.jbnu.calelog.dto.ProjectUpdateRequestDto;
import com.jbnu.calelog.service.ProjectService;
import com.jbnu.calelog.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 프로젝트 관리 API를 제공하는 컨트롤러
 *             활동 프로젝트의 생성, 조회, 수정, 삭제 및 최근 활동 조회 기능을 담당
 */
@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "프로젝트 관리 API - 활동 프로젝트의 CRUD 및 통계 관리")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;

    @Operation(
        summary = "프로젝트 목록 조회", 
        description = "현재 로그인한 사용자의 모든 프로젝트를 현재 월 통계와 함께 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    [
                      {
                        "id": 1,
                        "name": "졸업 프로젝트",
                        "color": "#4a6cf7",
                        "startDate": "2025-01-01",
                        "endDate": "2025-12-31",
                        "monthlyRequiredHours": 40,
                        "statistics": {
                          "currentMonthHours": 25.5,
                          "progressRate": 63.75,
                          "isActive": true
                        }
                      }
                    ]
                    """)
            )
        ),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> getProjects() {
        Long userId = getCurrentUserId();
        List<ProjectResponseDto> projects = projectService.getAllProjectsWithStatistics(userId);
        return ResponseEntity.ok(projects);
    }

    @Operation(
        summary = "프로젝트 생성", 
        description = "새로운 활동 프로젝트를 생성합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201", 
            description = "생성 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "id": 2,
                      "name": "웹 개발 인턴십",
                      "color": "#00AA94",
                      "startDate": "2025-06-01",
                      "endDate": "2025-08-31",
                      "monthlyRequiredHours": 80,
                      "statistics": {
                        "currentMonthHours": 0.0,
                        "progressRate": 0.0,
                        "isActive": true
                      }
                    }
                    """)
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<ProjectResponseDto> createProject(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "프로젝트 생성 정보",
            content = @Content(
                examples = @ExampleObject(value = """
                    {
                      "name": "웹 개발 인턴십",
                      "color": "#00AA94",
                      "startDate": "2025-06-01",
                      "endDate": "2025-08-31",
                      "monthlyRequiredHours": 80
                    }
                    """)
            )
        )
        @Valid @RequestBody ProjectCreateRequestDto createProjectRequest) {
        Long userId = getCurrentUserId();
        ProjectResponseDto createdProject = projectService.createProject(createProjectRequest, userId);
        return ResponseEntity.status(201).body(createdProject);
    }

    @Operation(
        summary = "프로젝트 수정", 
        description = "기존 프로젝트의 정보를 수정합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> updateProject(
            @Parameter(description = "수정할 프로젝트 ID") @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequestDto updateProjectRequest) {
        Long userId = getCurrentUserId();
        ProjectResponseDto updatedProject = projectService.updateProject(id, updateProjectRequest, userId);
        return ResponseEntity.ok(updatedProject);
    }

    @Operation(
        summary = "프로젝트 삭제", 
        description = "프로젝트를 삭제합니다. 연결된 일정들의 project_id는 NULL로 설정됩니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @Parameter(description = "삭제할 프로젝트 ID") @PathVariable Long id) {
        Long userId = getCurrentUserId();
        projectService.deleteProject(id, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
        summary = "프로젝트 최근 활동 조회", 
        description = "특정 프로젝트의 최근 활동 내역을 조회합니다. 프론트엔드에서 실제 사용하는 API입니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    [
                      {
                        "id": 15,
                        "content": "데이터베이스 스키마 설계",
                        "date": "2025-06-10",
                        "startTime": "14:00",
                        "endTime": "17:00"
                      },
                      {
                        "id": 12,
                        "content": "백엔드 API 구현",
                        "date": "2025-06-08",
                        "startTime": "15:00",
                        "endTime": "19:00"
                      }
                    ]
                    """)
            )
        ),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @GetMapping("/{id}/activities")
    public ResponseEntity<List<ProjectActivityDto>> getProjectActivities(
            @Parameter(description = "조회할 프로젝트 ID") @PathVariable Long id,
            @Parameter(description = "조회할 개수 (기본값: 5)") @RequestParam(defaultValue = "5") int limit) {
        Long userId = getCurrentUserId();
        List<ProjectActivityDto> activities = projectService.getRecentActivities(id, limit, userId);
        return ResponseEntity.ok(activities);
    }

    @Operation(
        summary = "월별 프로젝트 통계 조회", 
        description = "특정 프로젝트의 특정 연월에 대한 통계 정보(완료 시간, 진행률)를 조회합니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "조회 성공",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "projectId": 1,
                      "year": 2025,
                      "month": 6,
                      "completedHours": 28.5,
                      "requiredHours": 40.0,
                      "progressPercentage": 71.25
                    }
                    """)
            )
        ),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
    })
    @GetMapping("/{id}/monthly-stats")
    public ResponseEntity<ProjectMonthlyStatsDto> getProjectMonthlyStats(
            @Parameter(description = "조회할 프로젝트 ID") @PathVariable Long id,
            @Parameter(description = "조회할 연도") @RequestParam(required = true) Integer year,
            @Parameter(description = "조회할 월 (1-12)") @RequestParam(required = true) Integer month) {
        Long userId = getCurrentUserId();
        ProjectMonthlyStatsDto stats = projectService.getMonthlyStats(id, year, month, userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * 현재 인증된 사용자의 ID를 SecurityContext에서 추출
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.getDetails() instanceof Long) {
            return (Long) authentication.getDetails();
        }
        
        // JWT에서 사용자 ID 추출 실패 시 이메일로 조회
        if (authentication != null && authentication.getName() != null) {
            return userService.findByEmail(authentication.getName()).getId();
        }
        
        throw new RuntimeException("인증된 사용자 정보를 찾을 수 없습니다.");
    }
}