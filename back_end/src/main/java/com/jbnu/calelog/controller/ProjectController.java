package com.jbnu.calelog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
public class ProjectController {

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
    public ResponseEntity<?> getProjects() {
        // TODO: ProjectService.getAllProjectsWithStatistics(userId) 구현 예정
        return ResponseEntity.ok().body("[]");
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
    public ResponseEntity<?> createProject(
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
        @RequestBody Object createProjectRequest) {
        // TODO: ProjectService.createProject(request, userId) 구현 예정
        return ResponseEntity.status(201).body("{}");
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
    public ResponseEntity<?> updateProject(
            @Parameter(description = "수정할 프로젝트 ID") @PathVariable Long id,
            @RequestBody Object updateProjectRequest) {
        // TODO: ProjectService.updateProject(id, request, userId) 구현 예정
        return ResponseEntity.ok().body("{}");
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
    public ResponseEntity<?> deleteProject(
            @Parameter(description = "삭제할 프로젝트 ID") @PathVariable Long id) {
        // TODO: ProjectService.deleteProject(id, userId) 구현 예정
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
    public ResponseEntity<?> getProjectActivities(
            @Parameter(description = "조회할 프로젝트 ID") @PathVariable Long id,
            @Parameter(description = "조회할 개수 (기본값: 5)") @RequestParam(defaultValue = "5") int limit) {
        // TODO: ProjectService.getRecentActivities(id, limit, userId) 구현 예정
        return ResponseEntity.ok().body("[]");
    }
}