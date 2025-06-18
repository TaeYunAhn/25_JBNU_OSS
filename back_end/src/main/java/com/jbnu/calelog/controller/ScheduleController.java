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
 * @description 일정 관리 API를 제공하는 컨트롤러
 *             단일 일정과 반복 일정의 생성, 조회, 수정, 삭제 기능을 담당
 */
@RestController
@RequestMapping("/api/schedules")
@Tag(name = "Schedules", description = "일정 관리")
@SecurityRequirement(name = "bearerAuth")
public class ScheduleController {

    @Operation(summary = "월별 일정 조회", description = "지정된 년도와 월의 모든 일정을 조회합니다. 단일 일정과 반복 일정을 모두 포함합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 년도 또는 월 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping
    public ResponseEntity<?> getMonthlySchedules(
            @Parameter(description = "조회할 년도") @RequestParam int year,
            @Parameter(description = "조회할 월 (1-12)") @RequestParam int month) {
        // 월별 일정 조회 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "새 일정 생성", description = "새로운 단일 일정 또는 반복 일정을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "409", description = "일정 중복")
    })
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody Object createScheduleRequest) {
        // 일정 생성 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "일정 수정", description = "기존 일정을 수정합니다. 반복 일정의 경우 수정 범위를 지정할 수 있습니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "일정 중복")
    })
    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(
            @Parameter(description = "수정할 일정 ID (단일 일정) 또는 규칙 ID (반복 일정)") @PathVariable Long scheduleId,
            @RequestBody Object updateScheduleRequest) {
        // 일정 수정 로직 구현 예정
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "일정 삭제", description = "일정을 삭제합니다. 반복 일정의 경우 삭제 범위를 지정할 수 있습니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "일정을 찾을 수 없음")
    })
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSchedule(
            @Parameter(description = "삭제할 일정 ID (단일 일정) 또는 규칙 ID (반복 일정)") @PathVariable Long scheduleId,
            @RequestBody Object deleteScheduleRequest) {
        // 일정 삭제 로직 구현 예정
        return ResponseEntity.ok().build();
    }
}