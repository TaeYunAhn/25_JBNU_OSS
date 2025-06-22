package com.jbnu.calelog.controller;

import com.jbnu.calelog.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * @author Bae-Jihyeok, qowlgur121@gmail.com
 * @date 2025-06-21
 * @description 활동일지 내보내기 API를 제공하는 컨트롤러
 *             HWP 호환 XLSX 활동일지 생성 및 다운로드 기능을 담당
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/export")
@Tag(name = "Export", description = "활동일지 내보내기 API - HWP 호환 XLSX 파일 생성")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @Operation(
        summary = "활동일지 Excel 파일 생성", 
        description = """
            지정된 기간의 활동 내역을 바탕으로 HWP 호환 XLSX 파일을 생성하여 다운로드합니다.
            
            **Excel 표 형식:**
            - 근무일자: 25. 6. 5. 형식
            - 시작/종료: 09:00 형식  
            - 시간: 정수 (3시간)
            - 내용: 활동 내용
            
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
    public ResponseEntity<byte[]> exportActivityLog(
            @Parameter(description = "내보낼 년도", example = "2025", required = true) 
            @RequestParam int year,
            
            @Parameter(description = "내보낼 월 (1-12)", example = "6", required = true) 
            @RequestParam int month,
            
            @Parameter(description = "특정 프로젝트만 내보내기 (선택사항)", example = "1") 
            @RequestParam(required = false) Long projectId) {

        Long userId = getCurrentUserId();
        try {
            byte[] excelFile = exportService.generateActivityReport(year, month, projectId, userId);

            if (excelFile == null || excelFile.length == 0) {
                return ResponseEntity.notFound().build();
            }

            String fileName = "활동일지_" + year + "_" + month + ".xlsx";
            String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", encodedFileName);

            return new ResponseEntity<>(excelFile, headers, HttpStatus.OK);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 로그인한 사용자의 ID를 가져옵니다.
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("User not authenticated");
        }
        
        // JwtAuthenticationFilter에서 details에 userId를 저장했으므로, getDetails()를 사용합니다.
        Object details = authentication.getDetails();
        if (details instanceof Long) {
            return (Long) details;
        }

        // 만약의 경우를 대비한 폴백 로직
        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new IllegalStateException("사용자 ID를 인증 정보에서 찾을 수 없습니다.", e);
        }
    }
}