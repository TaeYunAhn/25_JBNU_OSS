package com.jbnu.calelog.controller;

import com.jbnu.calelog.dto.*;
import com.jbnu.calelog.service.ScheduleService;
import com.jbnu.calelog.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
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
 * @description 일정 관리 API를 제공하는 컨트롤러
 *             단일 일정과 반복 일정의 생성, 조회, 수정, 삭제 및 시간 중복 검증 기능을 담당
 */
@RestController
@RequestMapping("/api/schedules")
@Tag(name = "Schedules", description = "일정 관리 API - 단일/반복 일정 관리 및 시간 중복 검증")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final UserService userService;

    @Operation(
        summary = "월별 일정 조회", 
        description = "지정된 년도와 월의 모든 일정을 조회합니다. 단일 일정과 반복 일정을 모두 포함합니다."
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
                        "title": "졸업 프로젝트 미팅",
                        "start": "2025-06-05T10:00:00",
                        "end": "2025-06-05T12:00:00",
                        "date": "2025-06-05",
                        "startTime": "10:00",
                        "endTime": "12:00",
                        "type": "PROJECT",
                        "projectId": 1,
                        "content": "팀원들과 주간 진행상황 공유",
                        "recurrenceId": null
                      },
                      {
                        "id": 6,
                        "title": "알고리즘 수업",
                        "start": "2025-06-06T09:00:00",
                        "end": "2025-06-06T12:00:00",
                        "date": "2025-06-06",
                        "startTime": "09:00",
                        "endTime": "12:00",
                        "type": "INACTIVE",
                        "projectId": null,
                        "description": "정규 수업",
                        "recurrenceId": null
                      }
                    ]
                    """)
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 년도 또는 월 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<List<ScheduleResponseDto>> getSchedules(
            @Parameter(description = "조회할 년도") @RequestParam int year,
            @Parameter(description = "조회할 월 (1-12)") @RequestParam int month) {
        Long userId = getCurrentUserId();
        List<ScheduleResponseDto> schedules = scheduleService.getMonthlySchedules(year, month, userId);
        return ResponseEntity.ok(schedules);
    }

    @Operation(
        summary = "일정 생성", 
        description = "새로운 단일 일정 또는 반복 일정을 생성합니다. 시간 중복 검증이 포함됩니다."
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201", 
            description = "생성 성공",
            content = @Content(
                mediaType = "application/json",
                examples = {
                    @ExampleObject(
                        name = "단일 일정 생성 응답",
                        value = """
                            {
                              "id": 20,
                              "title": "프로젝트 코딩",
                              "start": "2025-06-15T15:00:00",
                              "end": "2025-06-15T19:00:00",
                              "date": "2025-06-15",
                              "startTime": "15:00",
                              "endTime": "19:00",
                              "type": "PROJECT",
                              "projectId": 1,
                              "content": "백엔드 API 구현",
                              "recurrenceId": null
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "반복 일정 생성 응답",
                        value = """
                            {
                              "mainSchedule": {
                                "id": 21,
                                "title": "알고리즘 스터디",
                                "date": "2025-06-07",
                                "startTime": "14:00",
                                "endTime": "16:00",
                                "type": "PROJECT",
                                "projectId": 2,
                                "content": "그래프 알고리즘 문제 풀이",
                                "recurrenceId": "550e8400-e29b-41d4-a716-446655440000"
                              },
                              "schedules": [
                                "... 생성된 모든 반복 일정 배열"
                              ]
                            }
                            """
                    )
                }
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(
            responseCode = "409", 
            description = "일정 중복",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(value = """
                    {
                      "errorCode": "SCHEDULE_CONFLICT",
                      "message": "해당 시간에 이미 다른 일정이 존재합니다.",
                      "conflictSchedules": [
                        {
                          "id": 3,
                          "title": "기존 일정",
                          "startTime": "13:00",
                          "endTime": "15:00"
                        }
                      ]
                    }
                    """)
            )
        )
    })
    @PostMapping
    public ResponseEntity<ScheduleCreateResponseDto> createSchedule(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "일정 생성 정보",
            content = @Content(
                examples = {
                    @ExampleObject(
                        name = "단일 일정 생성",
                        value = """
                            {
                              "title": "프로젝트 코딩",
                              "type": "PROJECT",
                              "projectId": 1,
                              "content": "백엔드 API 구현",
                              "date": "2025-06-15",
                              "startTime": "15:00",
                              "endTime": "19:00",
                              "repeat": {
                                "enabled": false
                              }
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "반복 일정 생성",
                        value = """
                            {
                              "title": "알고리즘 스터디",
                              "type": "PROJECT",
                              "projectId": 2,
                              "content": "그래프 알고리즘 문제 풀이",
                              "date": "2025-06-07",
                              "startTime": "14:00",
                              "endTime": "16:00",
                              "repeat": {
                                "enabled": true,
                                "frequency": "weekly",
                                "interval": 1,
                                "days": ["1", "3", "5"],
                                "endType": "date",
                                "endDate": "2025-08-30"
                              }
                            }
                            """
                    ),
                    @ExampleObject(
                        name = "비활동 일정 생성",
                        value = """
                            {
                              "title": "알고리즘 수업",
                              "type": "INACTIVE",
                              "content": "정규 수업",
                              "date": "2025-06-06",
                              "startTime": "09:00",
                              "endTime": "12:00",
                              "repeat": {
                                "enabled": false
                              }
                            }
                            """
                    )
                }
            )
        )
        @Valid @RequestBody ScheduleCreateRequestDto createScheduleRequest) {
        Long userId = getCurrentUserId();
        ScheduleCreateResponseDto response = scheduleService.createSchedule(createScheduleRequest, userId);
        return ResponseEntity.status(201).body(response);
    }

    @Operation(
        summary = "일정 수정", 
        description = "기존 일정을 수정합니다. 반복 일정의 경우 개별 일정만 수정됩니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "일정 중복")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ScheduleResponseDto> updateSchedule(
            @Parameter(description = "수정할 일정 ID") @PathVariable Long id,
            @Valid @RequestBody ScheduleUpdateRequestDto updateScheduleRequest) {
        Long userId = getCurrentUserId();
        ScheduleResponseDto response = scheduleService.updateSchedule(id, updateScheduleRequest, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "일정 삭제", 
        description = "일정을 삭제합니다. 반복 일정의 경우 deleteAllRecurrences 옵션으로 전체 또는 단일 삭제를 선택할 수 있습니다."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @Parameter(description = "삭제할 일정 ID") @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "삭제 옵션 (반복 일정용)",
                content = @Content(
                    examples = @ExampleObject(value = """
                        {
                          "deleteAllRecurrences": true
                        }
                        """)
                )
            )
            @RequestBody(required = false) ScheduleDeleteRequestDto deleteScheduleRequest) {
        Long userId = getCurrentUserId();
        ScheduleDeleteRequestDto request = deleteScheduleRequest != null ? deleteScheduleRequest : new ScheduleDeleteRequestDto();
        scheduleService.deleteSchedule(id, request, userId);
        return ResponseEntity.noContent().build();
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