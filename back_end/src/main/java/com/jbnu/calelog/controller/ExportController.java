package com.jbnu.calelog.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-18
 * @description 활동일지 내보내기 API를 제공하는 컨트롤러
 *             HWP 호환 엑셀 활동일지 생성 및 다운로드 기능을 담당
 */
@RestController
@RequestMapping("/api/export")
@Tag(name = "Export", description = "활동일지 내보내기")
@SecurityRequirement(name = "bearerAuth")
public class ExportController {

    @Operation(summary = "활동일지 표 생성 및 다운로드", 
               description = "지정된 기간과 프로젝트의 활동 내역을 바탕으로 HWP 호환 엑셀 표를 생성하여 다운로드합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "파일 생성 및 다운로드 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "해당 조건에 맞는 활동 내역이 없음")
    })
    @PostMapping
    public ResponseEntity<?> exportActivityLog(@RequestBody Object exportRequest) {
        // 활동일지 생성 및 다운로드 로직 구현 예정
        return ResponseEntity.ok().build();
    }
}