package com.jbnu.calelog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 활동일지 내보내기 API를 제공하는 컨트롤러
 *             HWP 호환 XLSX 활동일지 생성 및 다운로드 기능을 담당
 */
@RestController
@RequestMapping("/api/export")
@Tag(name = "Export", description = "활동일지 내보내기 API - HWP 호환 XLSX 파일 생성")
@SecurityRequirement(name = "bearerAuth")
public class ExportController {

    @Operation(
        summary = "활동일지 Excel 파일 생성", 
        description = """
            지정된 기간의 활동 내역을 바탕으로 HWP 호환 XLSX 파일을 생성하여 다운로드합니다.
            
            **Excel 표 형식:**
            - 근무일자: 25. 6. 5. 형식
            - 시작/종료: 09:00 형식  
            - 시간: 정수 (3시간)
            - 내용: 활동 내용
            - 학생서명: 공란
            
            **파일명:** 활동일지_2025_6.xlsx
            """
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "Excel 파일 생성 및 다운로드 성공",
            content = @Content(
                mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        ),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "해당 조건에 맞는 활동 내역이 없음")
    })
    @GetMapping
    public ResponseEntity<?> exportActivityLog(
            @Parameter(
                description = "내보낼 년도", 
                example = "2025",
                required = true
            ) 
            @RequestParam int year,
            
            @Parameter(
                description = "내보낼 월 (1-12)", 
                example = "6",
                required = true
            ) 
            @RequestParam int month,
            
            @Parameter(
                description = "파일 형식 (기본값: xlsx)", 
                example = "xlsx"
            ) 
            @RequestParam(defaultValue = "xlsx") String format,
            
            @Parameter(
                description = "특정 프로젝트만 내보내기 (선택사항)", 
                example = "1"
            ) 
            @RequestParam(required = false) Long projectId) {
        
        // TODO: ExportService.generateActivityReport(year, month, projectId, userId) 구현 예정
        // Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
        // Content-Disposition: attachment; filename="활동일지_2025_6.xlsx"
        
        return ResponseEntity.ok()
            .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
            .header("Content-Disposition", "attachment; filename=\"활동일지_" + year + "_" + month + ".xlsx\"")
            .body("Binary Excel File Content");
    }
}